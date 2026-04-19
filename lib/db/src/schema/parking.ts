import {
  pgTable,
  text,
  integer,
  timestamp,
  doublePrecision,
  uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  role: text("role").notNull().default("driver"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const spotsTable = pgTable("spots", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  zone: text("zone").notNull(),
  level: integer("level").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("available"),
  hourlyRate: doublePrecision("hourly_rate").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const vehiclesTable = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  plate: text("plate").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  color: text("color").notNull(),
  type: text("type").notNull(),
  ownerName: text("owner_name"),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reservationsTable = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  spotId: uuid("spot_id")
    .notNull()
    .references(() => spotsTable.id, { onDelete: "cascade" }),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehiclesTable.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("upcoming"),
  totalCost: doublePrecision("total_cost").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const transactionsTable = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  reservationId: uuid("reservation_id")
    .notNull()
    .references(() => reservationsTable.id, { onDelete: "cascade" }),
  durationMinutes: integer("duration_minutes").notNull(),
  amount: doublePrecision("amount").notNull(),
  status: text("status").notNull().default("paid"),
  paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type Spot = typeof spotsTable.$inferSelect;
export type Vehicle = typeof vehiclesTable.$inferSelect;
export type Reservation = typeof reservationsTable.$inferSelect;
export type Transaction = typeof transactionsTable.$inferSelect;
