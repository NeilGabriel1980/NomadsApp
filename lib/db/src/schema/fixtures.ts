import { sql } from "drizzle-orm";
import { check, date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const fixtureImportsTable = pgTable("fixture_imports", {
  id: serial("id").primaryKey(),
  season: text("season").notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fixturesTable = pgTable("fixtures", {
  id: serial("id").primaryKey(),
  importId: integer("import_id").notNull().references(() => fixtureImportsTable.id, { onDelete: "cascade" }),
  season: text("season").notNull(),
  externalId: text("external_id"),
  fixtureDate: date("fixture_date", { mode: "string" }).notNull(),
  kickoff: text("kickoff").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  competition: text("competition").notNull(),
  status: text("status", { enum: ["scheduled", "postponed", "cancelled"] }).notNull().default("scheduled"),
  pitchLocation: text("pitch_location"),
  pitchAddress: text("pitch_address"),
  sourceUrl: text("source_url").notNull(),
}, (table) => [
  check("fixtures_status_check", sql`${table.status} in ('scheduled', 'postponed', 'cancelled')`),
]);

export type FixtureImport = typeof fixtureImportsTable.$inferSelect;
export type Fixture = typeof fixturesTable.$inferSelect;