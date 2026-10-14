import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const matchReportsTable = pgTable("match_reports", {
  id: serial("id").primaryKey(),
  season: text("season").notNull(),
  matchDate: text("match_date").notNull(),
  opponent: text("opponent").notNull(),
  score: text("score").notNull().default(""),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MatchReport = typeof matchReportsTable.$inferSelect;
export type InsertMatchReport = typeof matchReportsTable.$inferInsert;