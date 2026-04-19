import {
  db,
  reservationsTable,
  spotsTable,
  transactionsTable,
} from "@workspace/db";
import { and, eq, gt, lte, inArray, notInArray, or } from "drizzle-orm";
import { logger } from "./logger";

const TICK_INTERVAL_MS = 30_000;

export async function processReservationTransitions(now: Date = new Date()) {
  let activated = 0;
  let completed = 0;

  const toActivate = await db
    .select()
    .from(reservationsTable)
    .where(
      and(
        eq(reservationsTable.status, "upcoming"),
        lte(reservationsTable.startTime, now),
      ),
    );

  const stillUpcoming = toActivate.filter((r) => r.endTime > now);
  const skipStraightToCompleted = toActivate.filter((r) => r.endTime <= now);

  if (stillUpcoming.length > 0) {
    const ids = stillUpcoming.map((r) => r.id);
    await db
      .update(reservationsTable)
      .set({ status: "active" })
      .where(inArray(reservationsTable.id, ids));
    await db
      .update(spotsTable)
      .set({ status: "occupied" })
      .where(
        inArray(
          spotsTable.id,
          stillUpcoming.map((r) => r.spotId),
        ),
      );
    activated = stillUpcoming.length;
  }

  const toComplete = await db
    .select()
    .from(reservationsTable)
    .where(
      and(
        inArray(reservationsTable.status, ["active", "upcoming"]),
        lte(reservationsTable.endTime, now),
      ),
    );

  const completeAll = [...toComplete, ...skipStraightToCompleted].filter(
    (r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx,
  );

  if (completeAll.length > 0) {
    const ids = completeAll.map((r) => r.id);
    await db
      .update(reservationsTable)
      .set({ status: "completed" })
      .where(inArray(reservationsTable.id, ids));

    const existingTx = await db
      .select({ reservationId: transactionsTable.reservationId })
      .from(transactionsTable)
      .where(inArray(transactionsTable.reservationId, ids));
    const existingSet = new Set(existingTx.map((t) => t.reservationId));

    const newTx = completeAll
      .filter((r) => !existingSet.has(r.id))
      .map((r) => ({
        reservationId: r.id,
        durationMinutes: Math.max(
          1,
          Math.round((r.endTime.getTime() - r.startTime.getTime()) / 60_000),
        ),
        amount: r.totalCost,
        status: "paid" as const,
      }));
    if (newTx.length > 0) {
      await db.insert(transactionsTable).values(newTx);
    }

    const spotIds = Array.from(new Set(completeAll.map((r) => r.spotId)));

    // For each affected spot, decide its new status:
    //   - "occupied" if any other reservation currently overlaps now
    //     (active, OR upcoming whose startTime has already arrived)
    //   - "reserved" if no current occupancy but a future reservation exists
    //   - "available" otherwise
    const liveOnSameSpots = await db
      .select({
        spotId: reservationsTable.spotId,
        status: reservationsTable.status,
        startTime: reservationsTable.startTime,
      })
      .from(reservationsTable)
      .where(
        and(
          inArray(reservationsTable.spotId, spotIds),
          notInArray(reservationsTable.id, ids),
          or(
            eq(reservationsTable.status, "active"),
            and(
              eq(reservationsTable.status, "upcoming"),
              lte(reservationsTable.startTime, now),
            ),
          ),
        ),
      );
    const occupiedSpots = new Set(liveOnSameSpots.map((r) => r.spotId));

    const futureOnSameSpots = await db
      .select({ spotId: reservationsTable.spotId })
      .from(reservationsTable)
      .where(
        and(
          inArray(reservationsTable.spotId, spotIds),
          notInArray(reservationsTable.id, ids),
          eq(reservationsTable.status, "upcoming"),
          gt(reservationsTable.startTime, now),
        ),
      );
    const reservedSpots = new Set(futureOnSameSpots.map((r) => r.spotId));

    const occupiedIds: string[] = [];
    const reservedIds: string[] = [];
    const availableIds: string[] = [];
    for (const id of spotIds) {
      if (occupiedSpots.has(id)) occupiedIds.push(id);
      else if (reservedSpots.has(id)) reservedIds.push(id);
      else availableIds.push(id);
    }
    if (occupiedIds.length > 0) {
      await db
        .update(spotsTable)
        .set({ status: "occupied" })
        .where(inArray(spotsTable.id, occupiedIds));
    }
    if (reservedIds.length > 0) {
      await db
        .update(spotsTable)
        .set({ status: "reserved" })
        .where(inArray(spotsTable.id, reservedIds));
    }
    if (availableIds.length > 0) {
      await db
        .update(spotsTable)
        .set({ status: "available" })
        .where(inArray(spotsTable.id, availableIds));
    }
    completed = completeAll.length;
  }

  return { activated, completed };
}

let timer: NodeJS.Timeout | null = null;

export function startReservationScheduler(intervalMs: number = TICK_INTERVAL_MS) {
  if (timer) return;
  const tick = async () => {
    try {
      const result = await processReservationTransitions();
      if (result.activated > 0 || result.completed > 0) {
        logger.info(
          { ...result },
          "Reservation scheduler processed transitions",
        );
      }
    } catch (err) {
      logger.error({ err }, "Reservation scheduler tick failed");
    }
  };
  void tick();
  timer = setInterval(tick, intervalMs);
  if (typeof timer.unref === "function") timer.unref();
  logger.info({ intervalMs }, "Reservation scheduler started");
}

export function stopReservationScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
