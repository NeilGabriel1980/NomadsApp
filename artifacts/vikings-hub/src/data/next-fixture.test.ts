import assert from "node:assert/strict";
import type { Fixture } from "@workspace/api-client-react";
import { getNextFixture, londonDate } from "./next-fixture";
import type { Match } from "./season";

const fixture = (id: number, date: string, status: Fixture["status"] = "scheduled", kickoff = "09:00"): Fixture => ({
  id, date, status, kickoff, externalId: null, competition: "League",
  homeTeam: "Vikings", awayTeam: `Opponent ${id}`, opponent: `Opponent ${id}`,
  venue: "Home", sourceUrl: "https://fulltime.thefa.com/",
});
const rows = [
  fixture(1, "2026-10-09"),
  fixture(2, "2026-10-10", "postponed"),
  fixture(3, "2026-10-11", "cancelled"),
  fixture(4, "2026-10-17"),
  fixture(5, "2026-10-17", "scheduled", "08:00"),
];
assert.equal(getNextFixture(rows, [], "2026-10-10")?.id, 5);
assert.equal(getNextFixture(rows.slice(0, 3), [], "2026-10-10"), undefined);
assert.equal(getNextFixture([], [], "2026-10-10"), undefined);
assert.equal(getNextFixture([fixture(2, "2026-10-10")], [], "2026-10-10")?.id, 2);
const matches = [{ matchDate: "2026-10-17", opponent: " opponent 5 " }] as Match[];
assert.equal(getNextFixture(rows, matches, "2026-10-10")?.id, 4);
// Older cached/imported fixtures may have no status at runtime.
const { status: _status, ...oldFixture } = fixture(6, "2026-10-10");
assert.equal(getNextFixture([oldFixture as Fixture], [], "2026-10-10")?.id, 6);
assert.equal(londonDate(new Date("2026-07-01T23:30:00Z")), "2026-07-02");
console.log("PASS: next match excludes postponed, cancelled, past and played fixtures; supports legacy statuses, same-day matches and kickoff ordering.");
