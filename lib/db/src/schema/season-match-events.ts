import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { seasonMatchesTable } from "./season-matches";

export const seasonMatchEventsTable = pgTable("season_match_events", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => seasonMatchesTable.id, { onDelete: "cascade" }),
  player: text("player").notNull(),
  eventType: text("event_type").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SeasonMatchEvent = typeof seasonMatchEventsTable.$inferSelect;
export type InsertSeasonMatchEvent = typeof seasonMatchEventsTable.$inferInsert;