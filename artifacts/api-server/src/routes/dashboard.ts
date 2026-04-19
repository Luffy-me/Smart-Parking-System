import { Router, type IRouter } from "express";
import {
  db,
  spotsTable,
  vehiclesTable,
  reservationsTable,
  transactionsTable,
} from "@workspace/db";
import { sql, gte, desc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res) => {
  const spots = await db.select().from(spotsTable);
  const total = spots.length;
  const counts = { available: 0, occupied: 0, reserved: 0, maintenance: 0 };
  for (const s of spots) {
    if (s.status in counts) counts[s.status as keyof typeof counts]++;
  }
  const utilization = total
    ? Math.round(((counts.occupied + counts.reserved) / total) * 1000) / 1000
    : 0;

  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const startWeek = new Date();
  startWeek.setDate(startWeek.getDate() - 7);

  const [todayAgg] = await db
    .select({
      total: sql<number>`coalesce(sum(${transactionsTable.amount}), 0)`,
    })
    .from(transactionsTable)
    .where(gte(transactionsTable.paidAt, startToday));

  const [weekAgg] = await db
    .select({
      total: sql<number>`coalesce(sum(${transactionsTable.amount}), 0)`,
    })
    .from(transactionsTable)
    .where(gte(transactionsTable.paidAt, startWeek));

  const activeRes = await db
    .select({ id: reservationsTable.id })
    .from(reservationsTable)
    .where(
      sql`${reservationsTable.status} in ('upcoming', 'active')`,
    );

  const vehicles = await db.select({ id: vehiclesTable.id }).from(vehiclesTable);

  res.json({
    totalSpots: total,
    availableSpots: counts.available,
    occupiedSpots: counts.occupied,
    reservedSpots: counts.reserved,
    maintenanceSpots: counts.maintenance,
    utilizationRate: utilization,
    revenueToday: Number(todayAgg?.total ?? 0),
    revenueWeek: Number(weekAgg?.total ?? 0),
    activeReservations: activeRes.length,
    totalVehicles: vehicles.length,
  });
});

router.get("/dashboard/activity", async (_req, res) => {
  const reservations = await db
    .select({
      reservation: reservationsTable,
      spot: spotsTable,
      vehicle: vehiclesTable,
    })
    .from(reservationsTable)
    .leftJoin(spotsTable, eq(reservationsTable.spotId, spotsTable.id))
    .leftJoin(vehiclesTable, eq(reservationsTable.vehicleId, vehiclesTable.id))
    .orderBy(desc(reservationsTable.createdAt))
    .limit(8);

  const vehicles = await db
    .select()
    .from(vehiclesTable)
    .orderBy(desc(vehiclesTable.createdAt))
    .limit(4);

  type Activity = {
    id: string;
    kind:
      | "reservation_created"
      | "reservation_completed"
      | "spot_occupied"
      | "spot_freed"
      | "vehicle_added";
    message: string;
    spotCode?: string;
    vehiclePlate?: string;
    at: string;
  };

  const items: Activity[] = [];
  for (const r of reservations) {
    const plate = r.vehicle?.plate ?? "vehicle";
    const code = r.spot?.code ?? "spot";
    if (r.reservation.status === "completed") {
      items.push({
        id: `r-c-${r.reservation.id}`,
        kind: "reservation_completed",
        message: `${plate} completed parking at ${code}`,
        spotCode: code,
        vehiclePlate: plate,
        at: r.reservation.createdAt.toISOString(),
      });
    } else {
      items.push({
        id: `r-${r.reservation.id}`,
        kind: "reservation_created",
        message: `${plate} reserved ${code}`,
        spotCode: code,
        vehiclePlate: plate,
        at: r.reservation.createdAt.toISOString(),
      });
    }
  }
  for (const v of vehicles) {
    items.push({
      id: `v-${v.id}`,
      kind: "vehicle_added",
      message: `${v.plate} (${v.make} ${v.model}) registered`,
      vehiclePlate: v.plate,
      at: v.createdAt.toISOString(),
    });
  }
  items.sort((a, b) => (a.at < b.at ? 1 : -1));
  res.json(items.slice(0, 12));
});

router.get("/dashboard/zones", async (_req, res) => {
  const spots = await db.select().from(spotsTable);
  const zones = new Map<
    string,
    { zone: string; total: number; available: number; occupied: number; reserved: number }
  >();
  for (const s of spots) {
    if (!zones.has(s.zone)) {
      zones.set(s.zone, {
        zone: s.zone,
        total: 0,
        available: 0,
        occupied: 0,
        reserved: 0,
      });
    }
    const z = zones.get(s.zone)!;
    z.total++;
    if (s.status === "available") z.available++;
    else if (s.status === "occupied") z.occupied++;
    else if (s.status === "reserved") z.reserved++;
  }
  res.json(Array.from(zones.values()).sort((a, b) => a.zone.localeCompare(b.zone)));
});

router.get("/dashboard/revenue", async (_req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const rows = await db
    .select({
      transaction: transactionsTable,
    })
    .from(transactionsTable)
    .where(gte(transactionsTable.paidAt, start));

  const buckets = new Map<string, { revenue: number; sessions: number }>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), { revenue: 0, sessions: 0 });
  }
  for (const r of rows) {
    const key = r.transaction.paidAt.toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (b) {
      b.revenue += r.transaction.amount;
      b.sessions += 1;
    }
  }
  res.json(
    Array.from(buckets.entries()).map(([date, v]) => ({
      date,
      revenue: Math.round(v.revenue * 100) / 100,
      sessions: v.sessions,
    })),
  );
});

export default router;
