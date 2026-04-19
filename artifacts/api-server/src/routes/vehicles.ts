import { Router, type IRouter } from "express";
import { db, vehiclesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateVehicleBody,
  GetVehicleParams,
  UpdateVehicleParams,
  UpdateVehicleBody,
  DeleteVehicleParams,
} from "@workspace/api-zod";

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

router.get("/vehicles", async (_req, res) => {
  const rows = await db
    .select()
    .from(vehiclesTable)
    .orderBy(desc(vehiclesTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/vehicles", async (req, res) => {
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
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create vehicle" });
    return;
  }
  res.status(201).json(serialize(row));
});

router.get("/vehicles/:id", async (req, res) => {
  const { id } = GetVehicleParams.parse(req.params);
  const [row] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(serialize(row));
});

router.patch("/vehicles/:id", async (req, res) => {
  const { id } = UpdateVehicleParams.parse(req.params);
  const body = UpdateVehicleBody.parse(req.body);
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

router.delete("/vehicles/:id", async (req, res) => {
  const { id } = DeleteVehicleParams.parse(req.params);
  await db.delete(vehiclesTable).where(eq(vehiclesTable.id, id));
  res.status(204).end();
});

export default router;
