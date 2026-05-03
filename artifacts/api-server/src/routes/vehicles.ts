import { Router, type IRouter } from "express";
import { db, vehiclesTable, reservationsTable } from "@workspace/db";
import { eq, desc, and, inArray } from "drizzle-orm";
import {
  CreateVehicleBody,
  GetVehicleParams,
  UpdateVehicleParams,
  UpdateVehicleBody,
  DeleteVehicleParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function serialize(v: typeof vehiclesTable.$inferSelect) {
  return {
    id: v.id,
    plate: v.plate,
    make: v.make,
    model: v.model,
    color: v.color,
    type: v.type,
    ownerName: v.ownerName ?? undefined,
    createdAt: v.createdAt.toISOString(),
  };
}

router.get("/vehicles", requireAuth, async (req, res) => {
  const where =
    req.auth!.role === "operator"
      ? undefined
      : eq(vehiclesTable.userId, req.auth!.userId);
  const rows = await db
    .select()
    .from(vehiclesTable)
    .where(where)
    .orderBy(desc(vehiclesTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/vehicles", requireAuth, async (req, res) => {
  const body = CreateVehicleBody.parse(req.body);
  const [row] = await db
    .insert(vehiclesTable)
    .values({
      plate: body.plate,
      make: body.make,
      model: body.model,
      color: body.color,
      type: body.type,
      ownerName: body.ownerName ?? null,
      userId: req.auth!.userId,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create vehicle" });
    return;
  }
  res.status(201).json(serialize(row));
});

async function findOwnedVehicle(id: string, userId: string, isOperator: boolean) {
  const conds = [eq(vehiclesTable.id, id)];
  if (!isOperator) conds.push(eq(vehiclesTable.userId, userId));
  const [row] = await db
    .select()
    .from(vehiclesTable)
    .where(and(...conds));
  return row;
}

router.get("/vehicles/:id", requireAuth, async (req, res) => {
  const { id } = GetVehicleParams.parse(req.params);
  const row = await findOwnedVehicle(
    id,
    req.auth!.userId,
    req.auth!.role === "operator",
  );
  if (!row) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(serialize(row));
});

router.patch("/vehicles/:id", requireAuth, async (req, res) => {
  const { id } = UpdateVehicleParams.parse(req.params);
  const body = UpdateVehicleBody.parse(req.body);
  const owned = await findOwnedVehicle(
    id,
    req.auth!.userId,
    req.auth!.role === "operator",
  );
  if (!owned) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  const [row] = await db
    .update(vehiclesTable)
    .set({
      plate: body.plate,
      make: body.make,
      model: body.model,
      color: body.color,
      type: body.type,
      ownerName: body.ownerName ?? null,
    })
    .where(eq(vehiclesTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/vehicles/:id", requireAuth, async (req, res) => {
  const { id } = DeleteVehicleParams.parse(req.params);
  const owned = await findOwnedVehicle(
    id,
    req.auth!.userId,
    req.auth!.role === "operator",
  );
  if (!owned) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }

  // Prevent deletion if vehicle has active or upcoming reservations
  const [liveReservation] = await db
    .select({ id: reservationsTable.id })
    .from(reservationsTable)
    .where(
      and(
        eq(reservationsTable.vehicleId, id),
        inArray(reservationsTable.status, ["active", "upcoming"]),
      ),
    )
    .limit(1);

  if (liveReservation) {
    res.status(409).json({
      error: "Cannot delete vehicle with active or upcoming reservations. Cancel them first.",
    });
    return;
  }

  await db.delete(vehiclesTable).where(eq(vehiclesTable.id, id));
  res.status(204).end();
});

export default router;
