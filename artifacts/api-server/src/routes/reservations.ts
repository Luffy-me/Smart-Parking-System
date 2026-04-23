import { Router, type IRouter } from "express";
import {
  db,
  reservationsTable,
  spotsTable,
  vehiclesTable,
  transactionsTable,
} from "@workspace/db";
import { eq, and, desc, gt, inArray, lte, or, lt, ne } from "drizzle-orm";
import {
  ListReservationsQueryParams,
  CreateReservationBody,
  GetReservationParams,
  UpdateReservationParams,
  UpdateReservationBody,
  CancelReservationParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

type Row = {
  reservation: typeof reservationsTable.$inferSelect;
  spot: typeof spotsTable.$inferSelect | null;
  vehicle: typeof vehiclesTable.$inferSelect | null;
};

type DbExecutor = Pick<typeof db, "select" | "insert" | "update">;

function serialize(r: Row) {
  return {
    id: r.reservation.id,
    spotId: r.reservation.spotId,
    spotCode: r.spot?.code ?? "",
    vehicleId: r.reservation.vehicleId,
    vehiclePlate: r.vehicle?.plate ?? "",
    startTime: r.reservation.startTime.toISOString(),
    endTime: r.reservation.endTime.toISOString(),
    status: r.reservation.status,
    totalCost: r.reservation.totalCost,
    createdAt: r.reservation.createdAt.toISOString(),
  };
}

async function fetchJoined(filters: {
  status?: string;
  vehicleId?: string;
  id?: string;
  ownerUserId?: string;
}) {
  const conds = [];
  if (filters.status) conds.push(eq(reservationsTable.status, filters.status));
  if (filters.vehicleId)
    conds.push(eq(reservationsTable.vehicleId, filters.vehicleId));
  if (filters.id) conds.push(eq(reservationsTable.id, filters.id));
  if (filters.ownerUserId)
    conds.push(eq(vehiclesTable.userId, filters.ownerUserId));
  const rows = await db
    .select({
      reservation: reservationsTable,
      spot: spotsTable,
      vehicle: vehiclesTable,
    })
    .from(reservationsTable)
    .leftJoin(spotsTable, eq(reservationsTable.spotId, spotsTable.id))
    .leftJoin(vehiclesTable, eq(reservationsTable.vehicleId, vehiclesTable.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(reservationsTable.startTime));
  return rows;
}

async function findOwnedReservation(
  id: string,
  userId: string,
  isOperator: boolean,
) {
  const [row] = await fetchJoined({
    id,
    ownerUserId: isOperator ? undefined : userId,
  });
  return row;
}

async function hasOverlappingReservation(
  executor: Pick<typeof db, "select">,
  spotId: string,
  start: Date,
  end: Date,
  excludeReservationId?: string,
) {
  // Time-range overlap: existing.start < new.end && existing.end > new.start.
  const conds = [
    eq(reservationsTable.spotId, spotId),
    inArray(reservationsTable.status, ["upcoming", "active"]),
    lt(reservationsTable.startTime, end),
    gt(reservationsTable.endTime, start),
  ];
  if (excludeReservationId) {
    conds.push(ne(reservationsTable.id, excludeReservationId));
  }

  const [conflict] = await executor
    .select({ id: reservationsTable.id })
    .from(reservationsTable)
    .where(and(...conds))
    .limit(1);
  return Boolean(conflict);
}

async function recomputeSpotStatus(
  executor: DbExecutor,
  spotId: string,
  excludeReservationId?: string,
) {
  // Spot is occupied when a live reservation overlaps "now", reserved when only
  // future reservations exist, and available otherwise.
  const now = new Date();
  const occupiedConds = [
    eq(reservationsTable.spotId, spotId),
    gt(reservationsTable.endTime, now),
    or(
      eq(reservationsTable.status, "active"),
      and(
        eq(reservationsTable.status, "upcoming"),
        lte(reservationsTable.startTime, now),
      ),
    ),
  ];
  if (excludeReservationId) {
    occupiedConds.push(ne(reservationsTable.id, excludeReservationId));
  }

  const [occupied] = await executor
    .select({ id: reservationsTable.id })
    .from(reservationsTable)
    .where(and(...occupiedConds))
    .limit(1);

  if (occupied) {
    await executor
      .update(spotsTable)
      .set({ status: "occupied" })
      .where(eq(spotsTable.id, spotId));
    return;
  }

  const reservedConds = [
    eq(reservationsTable.spotId, spotId),
    eq(reservationsTable.status, "upcoming"),
    gt(reservationsTable.startTime, now),
  ];
  if (excludeReservationId) {
    reservedConds.push(ne(reservationsTable.id, excludeReservationId));
  }

  const [reserved] = await executor
    .select({ id: reservationsTable.id })
    .from(reservationsTable)
    .where(and(...reservedConds))
    .limit(1);

  await executor
    .update(spotsTable)
    .set({ status: reserved ? "reserved" : "available" })
    .where(eq(spotsTable.id, spotId));
}

router.get("/reservations", requireAuth, async (req, res) => {
  const params = ListReservationsQueryParams.parse(req.query);
  const isOperator = req.auth!.role === "operator";
  const rows = await fetchJoined({
    status: params.status,
    vehicleId: params.vehicleId,
    ownerUserId: isOperator ? undefined : req.auth!.userId,
  });
  res.json(rows.map(serialize));
});

router.post("/reservations", requireAuth, async (req, res) => {
  const body = CreateReservationBody.parse(req.body);
  const [spot] = await db
    .select()
    .from(spotsTable)
    .where(eq(spotsTable.id, body.spotId));
  if (!spot) {
    res.status(404).json({ error: "Spot not found" });
    return;
  }
  // Verify the vehicle belongs to the current user (operators can use any).
  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, body.vehicleId));
  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  if (req.auth!.role !== "operator" && vehicle.userId !== req.auth!.userId) {
    res.status(403).json({ error: "Vehicle does not belong to you" });
    return;
  }
  const start = new Date(body.startTime);
  const end = new Date(body.endTime);
  if (end <= start) {
    res.status(400).json({ error: "endTime must be after startTime" });
    return;
  }

  const hours = (end.getTime() - start.getTime()) / 3_600_000;
  const totalCost = Math.round(hours * spot.hourlyRate * 100) / 100;
  const now = new Date();
  const status = start > now ? "upcoming" : end > now ? "active" : "completed";
  let createConflict = false;

  const [row] = await db.transaction(async (tx) => {
    const hasOverlap = await hasOverlappingReservation(
      tx,
      body.spotId,
      start,
      end,
    );
    if (hasOverlap) {
      createConflict = true;
      return [];
    }

    const [inserted] = await tx
      .insert(reservationsTable)
      .values({
        spotId: body.spotId,
        vehicleId: body.vehicleId,
        startTime: start,
        endTime: end,
        status,
        totalCost,
      })
      .returning();

    if (!inserted) return [];

    if (status !== "completed") {
      await tx
        .update(spotsTable)
        .set({ status: status === "active" ? "occupied" : "reserved" })
        .where(eq(spotsTable.id, body.spotId));
    } else {
      await recomputeSpotStatus(tx, body.spotId, inserted.id);
    }

    return [inserted];
  });

  if (!row) {
    if (createConflict) {
      res
        .status(409)
        .json({ error: "Spot is already reserved for this time range" });
      return;
    }
    res.status(500).json({ error: "Failed to create reservation" });
    return;
  }

  const [joined] = await fetchJoined({ id: row.id });
  res.status(201).json(serialize(joined!));
});

router.get("/reservations/:id", requireAuth, async (req, res) => {
  const { id } = GetReservationParams.parse(req.params);
  const joined = await findOwnedReservation(
    id,
    req.auth!.userId,
    req.auth!.role === "operator",
  );
  if (!joined) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }
  res.json(serialize(joined));
});

router.patch("/reservations/:id", requireAuth, async (req, res) => {
  const { id } = UpdateReservationParams.parse(req.params);
  const body = UpdateReservationBody.parse(req.body);
  const isOperator = req.auth!.role === "operator";
  const owned = await findOwnedReservation(id, req.auth!.userId, isOperator);
  if (!owned) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  const startTime = body.startTime
    ? new Date(body.startTime)
    : owned.reservation.startTime;
  const endTime = body.endTime ? new Date(body.endTime) : owned.reservation.endTime;
  if (endTime <= startTime) {
    res.status(400).json({ error: "endTime must be after startTime" });
    return;
  }

  const nextStatus = body.status ?? owned.reservation.status;

  const updates: Partial<typeof reservationsTable.$inferInsert> = {};
  if (body.status) updates.status = body.status;
  if (body.startTime) updates.startTime = startTime;
  if (body.endTime) updates.endTime = endTime;
  if (body.startTime || body.endTime) {
    const hourlyRate = owned.spot?.hourlyRate ?? 0;
    const hours = (endTime.getTime() - startTime.getTime()) / 3_600_000;
    updates.totalCost = Math.round(hours * hourlyRate * 100) / 100;
  }
  let updateConflict = false;

  const [row] = await db.transaction(async (tx) => {
    if (nextStatus === "active" || nextStatus === "upcoming") {
      const hasOverlap = await hasOverlappingReservation(
        tx,
        owned.reservation.spotId,
        startTime,
        endTime,
        id,
      );
      if (hasOverlap) {
        updateConflict = true;
        return [];
      }
    }

    const [updated] = await tx
      .update(reservationsTable)
      .set(updates)
      .where(eq(reservationsTable.id, id))
      .returning();
    if (!updated) return [];

    if (nextStatus === "completed") {
      const [existingTx] = await tx
        .select({ id: transactionsTable.id })
        .from(transactionsTable)
        .where(eq(transactionsTable.reservationId, updated.id))
        .limit(1);
      if (!existingTx) {
        const durationMinutes = Math.max(
          1,
          Math.round(
            (updated.endTime.getTime() - updated.startTime.getTime()) / 60_000,
          ),
        );
        await tx.insert(transactionsTable).values({
          reservationId: updated.id,
          durationMinutes,
          amount: updated.totalCost,
          status: "paid",
        });
      }
    }

    await recomputeSpotStatus(tx, updated.spotId, updated.id);
    return [updated];
  });

  if (!row) {
    if (updateConflict) {
      res
        .status(409)
        .json({ error: "Spot is already reserved for this time range" });
      return;
    }
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  const [joined] = await fetchJoined({ id: row.id });
  res.json(serialize(joined!));
});

router.delete("/reservations/:id", requireAuth, async (req, res) => {
  const { id } = CancelReservationParams.parse(req.params);
  const isOperator = req.auth!.role === "operator";
  const owned = await findOwnedReservation(id, req.auth!.userId, isOperator);
  if (!owned) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(reservationsTable)
      .set({ status: "cancelled" })
      .where(eq(reservationsTable.id, id))
      .returning();
    if (!updated) {
      return;
    }

    await recomputeSpotStatus(tx, updated.spotId, updated.id);
  });

  res.status(204).end();
});

export default router;
