import type { Fixture } from "@workspace/api-client-react";
import type { Match } from "./season";

export function londonDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function getNextFixture(fixtures: Fixture[], matches: Match[], today: string): Fixture | undefined {
  return [...fixtures]
    .filter((fixture) =>
      (fixture.status ?? "scheduled") === "scheduled" &&
      fixture.date.slice(0, 10) >= today &&
      !matches.some((match) =>
        match.matchDate?.slice(0, 10) === fixture.date.slice(0, 10) &&
        match.opponent.trim().toLowerCase() === fixture.opponent.trim().toLowerCase(),
      ),
    )
    .sort((a, b) => `${a.date.slice(0, 10)}T${a.kickoff}`.localeCompare(`${b.date.slice(0, 10)}T${b.kickoff}`))[0];
}
