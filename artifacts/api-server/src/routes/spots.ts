import { Router, type IRouter } from "express";
import { db, spotsTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import {
  ListSpotsQueryParams,
  CreateSpotBody,
  GetSpotParams,
  UpdateSpotParams,
  UpdateSpotBody,
  DeleteSpotParams,
} from "@workspace/api-zod";
import { requireAuth, requireOperator } from "../middlewares/auth";

const router: IRouter = Router();

function serialize(s: typeof spotsTable.$inferSelect) {
  return {
    id: s.id,
    code: s.code,
    zone: s.zone,
    level: s.level,
    type: s.type,
    status: s.status,
    hourlyRate: s.hourlyRate,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/spots", requireAuth, async (req, res) => {
  const params = ListSpotsQueryParams.parse(req.query);
  const conds = [];
  if (params.zone) conds.push(eq(spotsTable.zone, params.zone));
  if (params.status) conds.push(eq(spotsTable.status, params.status));
  const rows = await db
    .select()
    .from(spotsTable)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(asc(spotsTable.zone), asc(spotsTable.code));
  res.json(rows.map(serialize));
});

router.post("/spots", requireAuth, requireOperator, async (req, res) => {
  const body = CreateSpotBody.parse(req.body);
  const [row] = await db
    .insert(spotsTable)
    .values({
      code: body.code,
      zone: body.zone,
      level: body.level,
      type: body.type,
      hourlyRate: body.hourlyRate,
      status: body.status ?? "available",
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create spot" });
    return;
  }
  res.status(201).json(serialize(row));
});

router.get("/spots/:id", requireAuth, async (req, res) => {
  const { id } = GetSpotParams.parse(req.params);
  const [row] = await db.select().from(spotsTable).where(eq(spotsTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Spot not found" });
    return;
  }
  res.json(serialize(row));
});

router.patch("/spots/:id", requireAuth, requireOperator, async (req, res) => {
  const { id } = UpdateSpotParams.parse(req.params);
  const body = UpdateSpotBody.parse(req.body);
  const [row] = await db
    .update(spotsTable)
    .set(body)
    .where(eq(spotsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Spot not found" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/spots/:id", requireAuth, requireOperator, async (req, res) => {
  const { id } = DeleteSpotParams.parse(req.params);
  await db.delete(spotsTable).where(eq(spotsTable.id, id));
  res.status(204).end();
});

export default router;
