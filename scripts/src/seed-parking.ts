import {
  db,
  spotsTable,
  vehiclesTable,
  reservationsTable,
  transactionsTable,
} from "@workspace/db";

async function main() {
  // Clear existing data
  await db.delete(transactionsTable);
  await db.delete(reservationsTable);
  await db.delete(spotsTable);
  await db.delete(vehiclesTable);

  // Spots — three zones, two levels each
  const zones: { zone: string; level: number; count: number; rate: number }[] =
    [
      { zone: "North Wing", level: 1, count: 12, rate: 4.5 },
      { zone: "North Wing", level: 2, count: 12, rate: 4.5 },
      { zone: "Central Plaza", level: 1, count: 16, rate: 6.0 },
      { zone: "Central Plaza", level: 2, count: 16, rate: 6.0 },
      { zone: "South Wing", level: 1, count: 10, rate: 3.5 },
    ];

  const types = ["standard", "compact", "accessible", "ev", "motorcycle"];
  const statuses = [
    "available",
    "available",
    "available",
    "available",
    "occupied",
    "occupied",
    "reserved",
    "maintenance",
  ];

  const spotRows: (typeof spotsTable.$inferInsert)[] = [];
  let spotIndex = 0;
  for (const z of zones) {
    const prefix = z.zone
      .split(" ")
      .map((w) => w[0])
      .join("");
    for (let i = 0; i < z.count; i++) {
      spotIndex++;
      let type = types[0]!;
      if (i % 8 === 0) type = "accessible";
      else if (i % 6 === 0) type = "ev";
      else if (i % 5 === 0) type = "motorcycle";
      else if (i % 3 === 0) type = "compact";
      const status = statuses[(spotIndex + z.level) % statuses.length]!;
      spotRows.push({
        code: `${prefix}-L${z.level}-${String(i + 1).padStart(2, "0")}`,
        zone: z.zone,
        level: z.level,
        type,
        status,
        hourlyRate: z.rate + (type === "ev" ? 1.5 : 0),
      });
    }
  }
  const insertedSpots = await db.insert(spotsTable).values(spotRows).returning();

  // Vehicles
  const vehicleSeed = [
    { plate: "ZK-4421", make: "Tesla", model: "Model 3", color: "Pearl White", type: "ev", ownerName: "Avery Chen" },
    { plate: "MX-9920", make: "Honda", model: "Civic", color: "Slate", type: "standard", ownerName: "Jordan Reyes" },
    { plate: "PR-1108", make: "Ducati", model: "Monster", color: "Red", type: "motorcycle", ownerName: "Sam Patel" },
    { plate: "VL-3357", make: "Mini", model: "Cooper", color: "British Racing", type: "compact", ownerName: "Robin Park" },
    { plate: "AC-7702", make: "Volkswagen", model: "ID.4", color: "Glacier Blue", type: "ev", ownerName: "Priya Singh" },
    { plate: "DR-5588", make: "Toyota", model: "Sienna", color: "Silver", type: "accessible", ownerName: "Casey Morgan" },
  ];
  const insertedVehicles = await db
    .insert(vehiclesTable)
    .values(vehicleSeed)
    .returning();

  // Reservations
  const now = Date.now();
  const day = 86_400_000;
  const hr = 3_600_000;

  type Plan = {
    spotIdx: number;
    vehicleIdx: number;
    startOffset: number;
    durationHours: number;
    status: "upcoming" | "active" | "completed" | "cancelled";
  };

  const plans: Plan[] = [
    { spotIdx: 0, vehicleIdx: 0, startOffset: 1 * hr, durationHours: 3, status: "upcoming" },
    { spotIdx: 1, vehicleIdx: 1, startOffset: 6 * hr, durationHours: 2, status: "upcoming" },
    { spotIdx: 2, vehicleIdx: 4, startOffset: -1 * hr, durationHours: 4, status: "active" },
    { spotIdx: 3, vehicleIdx: 2, startOffset: -2 * hr, durationHours: 5, status: "active" },
    { spotIdx: 4, vehicleIdx: 3, startOffset: -1 * day, durationHours: 3, status: "completed" },
    { spotIdx: 5, vehicleIdx: 5, startOffset: -2 * day, durationHours: 2, status: "completed" },
    { spotIdx: 6, vehicleIdx: 0, startOffset: -3 * day, durationHours: 4, status: "completed" },
    { spotIdx: 7, vehicleIdx: 1, startOffset: -4 * day, durationHours: 1.5, status: "completed" },
    { spotIdx: 8, vehicleIdx: 2, startOffset: -5 * day, durationHours: 3, status: "completed" },
    { spotIdx: 9, vehicleIdx: 4, startOffset: -6 * day, durationHours: 2.5, status: "completed" },
    { spotIdx: 10, vehicleIdx: 3, startOffset: -1 * day - 5 * hr, durationHours: 2, status: "completed" },
    { spotIdx: 11, vehicleIdx: 5, startOffset: -3 * day - 2 * hr, durationHours: 4, status: "completed" },
    { spotIdx: 12, vehicleIdx: 0, startOffset: 12 * hr, durationHours: 2, status: "upcoming" },
    { spotIdx: 13, vehicleIdx: 1, startOffset: -2 * day - 4 * hr, durationHours: 1, status: "cancelled" },
  ];

  for (const p of plans) {
    const spot = insertedSpots[p.spotIdx];
    const vehicle = insertedVehicles[p.vehicleIdx];
    if (!spot || !vehicle) continue;
    const startTime = new Date(now + p.startOffset);
    const endTime = new Date(startTime.getTime() + p.durationHours * hr);
    const totalCost = Math.round(p.durationHours * spot.hourlyRate * 100) / 100;
    const [r] = await db
      .insert(reservationsTable)
      .values({
        spotId: spot.id,
        vehicleId: vehicle.id,
        startTime,
        endTime,
        status: p.status,
        totalCost,
      })
      .returning();
    if (p.status === "completed" && r) {
      await db.insert(transactionsTable).values({
        reservationId: r.id,
        durationMinutes: Math.round(p.durationHours * 60),
        amount: totalCost,
        status: "paid",
        paidAt: endTime,
      });
    }
  }

  console.log(
    `Seeded: ${insertedSpots.length} spots, ${insertedVehicles.length} vehicles, ${plans.length} reservations`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
