import { Router, type IRouter } from "express";
import {
  db,
  reservationsTable,
  spotsTable,
  vehiclesTable,
  transactionsTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
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
  if (filters.status)
    conds.push(eq(reservationsTable.status, filters.status));
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
  if (
    req.auth!.role !== "operator" &&
    vehicle.userId !== req.auth!.userId
  ) {
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

  const [row] = await db
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

  if (!row) {
    res.status(500).json({ error: "Failed to create reservation" });
    return;
  }

  if (status !== "completed") {
    await db
      .update(spotsTable)
      .set({ status: status === "active" ? "occupied" : "reserved" })
      .where(eq(spotsTable.id, body.spotId));
  }

  const [joined] = await fetchJoined({ id: row.id });
  res.status(201).json(serialize(joined!));
});

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
  const updates: Partial<typeof reservationsTable.$inferInsert> = {};
  if (body.status) updates.status = body.status;
  if (body.startTime) updates.startTime = new Date(body.startTime);
  if (body.endTime) updates.endTime = new Date(body.endTime);
  const [row] = await db
    .update(reservationsTable)
    .set(updates)
    .where(eq(reservationsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  // Side-effects: if completed, free spot + record transaction
  if (body.status === "completed") {
    await db
      .update(spotsTable)
      .set({ status: "available" })
      .where(eq(spotsTable.id, row.spotId));
    const durationMinutes = Math.max(
      1,
      Math.round(
        (row.endTime.getTime() - row.startTime.getTime()) / 60_000,
      ),
    );
    await db.insert(transactionsTable).values({
      reservationId: row.id,
      durationMinutes,
      amount: row.totalCost,
      status: "paid",
    });
  } else if (body.status === "active") {
    await db
      .update(spotsTable)
      .set({ status: "occupied" })
      .where(eq(spotsTable.id, row.spotId));
  } else if (body.status === "cancelled") {
    await db
      .update(spotsTable)
      .set({ status: "available" })
      .where(eq(spotsTable.id, row.spotId));
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
  const [row] = await db
    .update(reservationsTable)
    .set({ status: "cancelled" })
    .where(eq(reservationsTable.id, id))
    .returning();
  if (row) {
    await db
      .update(spotsTable)
      .set({ status: "available" })
      .where(eq(spotsTable.id, row.spotId));
  }
  res.status(204).end();
});

export default router;
