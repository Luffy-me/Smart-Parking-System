import { Router, type IRouter } from "express";
import {
  db,
  transactionsTable,
  reservationsTable,
  spotsTable,
  vehiclesTable,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { ListTransactionsQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/transactions", requireAuth, async (req, res) => {
  const params = ListTransactionsQueryParams.parse(req.query);
  const conds = [];
  if (params.vehicleId)
    conds.push(eq(reservationsTable.vehicleId, params.vehicleId));
  if (req.auth!.role !== "operator")
    conds.push(eq(vehiclesTable.userId, req.auth!.userId));

  const rows = await db
    .select({
      transaction: transactionsTable,
      reservation: reservationsTable,
      spot: spotsTable,
      vehicle: vehiclesTable,
    })
    .from(transactionsTable)
    .innerJoin(
      reservationsTable,
      eq(transactionsTable.reservationId, reservationsTable.id),
    )
    .leftJoin(spotsTable, eq(reservationsTable.spotId, spotsTable.id))
    .leftJoin(vehiclesTable, eq(reservationsTable.vehicleId, vehiclesTable.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(transactionsTable.paidAt))
    .limit(params.limit ?? 100);

  res.json(
    rows.map((r) => ({
      id: r.transaction.id,
      reservationId: r.transaction.reservationId,
      spotCode: r.spot?.code ?? "",
      vehiclePlate: r.vehicle?.plate ?? "",
      durationMinutes: r.transaction.durationMinutes,
      amount: r.transaction.amount,
      paidAt: r.transaction.paidAt.toISOString(),
      status: r.transaction.status,
    })),
  );
});

export default router;
