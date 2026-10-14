import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const seasonMatchesTable = pgTable("season_matches", {
  id: serial("id").primaryKey(),
  season: text("season").notNull(),
  matchDate: text("match_date").notNull(),
  competition: text("competition").notNull(),
  type: text("type").notNull(),
  venue: text("venue").notNull(),
  opponent: text("opponent").notNull(),
  vikingsGF: integer("vikings_gf").notNull(),
  vikingsGA: integer("vikings_ga").notNull(),
  motm: text("motm").notNull().default(""),
  gotw: text("gotw"),
  captain: text("captain"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SeasonMatch = typeof seasonMatchesTable.$inferSelect;
export type InsertSeasonMatch = typeof seasonMatchesTable.$inferInsert;