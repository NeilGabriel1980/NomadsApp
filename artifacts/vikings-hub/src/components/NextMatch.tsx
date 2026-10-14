import React from "react";
import { Link } from "wouter";
import { getListFixturesQueryKey, useListFixtures } from "@workspace/api-client-react";
import { useSeason } from "@/context/SeasonContext";
import { getNextFixture, londonDate } from "@/data/next-fixture";
import { normalizeCompetition } from "@/data/competition";
import { CalendarDays, Clock, ExternalLink } from "lucide-react";
import { PitchLocation } from "@/components/PitchLocation";

export function NextMatch() {
  const { matches, seasonIsLoading, seasonHasError } = useSeason();
  const [today, setToday] = React.useState(londonDate);
  React.useEffect(() => {
    const timer = window.setInterval(() => setToday(londonDate()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const fixturesQuery = useListFixtures(
    { season: "2026/27" },
    { query: { queryKey: getListFixturesQueryKey({ season: "2026/27" }), staleTime: 60_000, refetchInterval: 60_000 } },
  );
  const fixture = getNextFixture(fixturesQuery.data?.fixtures ?? [], matches, today);
  const changedFixtures = (fixturesQuery.data?.fixtures ?? []).filter((entry) =>
    entry.date.slice(0, 10) >= today && (entry.status === "postponed" || entry.status === "cancelled"),
  );
  const meta = fixturesQuery.data?.importMeta;
  const sourceUrl = fixture?.sourceUrl || meta?.sourceUrl;
  const safeSourceUrl = sourceUrl && /^https?:\/\//i.test(sourceUrl) ? sourceUrl : undefined;
  const formatDate = (date: string) => new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London",
  }).format(new Date(date));

  return (
    <section aria-labelledby="next-match-heading" className="mb-10 rounded-3xl border-2 border-secondary/50 bg-card p-6 shadow-sm md:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="next-match-heading" className="flex items-center gap-2 font-display text-2xl font-bold text-primary">
          <CalendarDays className="text-secondary" aria-hidden="true" /> Next scheduled match
        </h2>
        <Link href="/fixtures" className="text-sm font-bold text-primary hover:underline">View all fixtures</Link>
      </div>
      {fixturesQuery.isLoading || seasonIsLoading ? (
        <p className="font-medium text-muted-foreground" role="status">Loading the next match…</p>
      ) : fixturesQuery.isError || seasonHasError ? (
        <div role="alert">
          <p className="font-medium text-muted-foreground">The next match could not be confirmed from the saved schedule and results.</p>
          <button type="button" onClick={() => fixturesQuery.refetch()} className="mt-2 text-sm font-bold text-primary underline">Retry fixtures</button>
        </div>
      ) : !fixture ? (
        <p className="font-medium text-muted-foreground">No upcoming scheduled matches are listed in the imported schedule. Check the Fixtures page or your coach for the next game.</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{fixture.venue}</span>
            <span className="text-muted-foreground">{normalizeCompetition(fixture.competition)}</span>
            {fixture.date.slice(0, 10) === today && <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">Today</span>}
          </div>
          <p className="mb-4 font-display text-2xl font-extrabold text-foreground md:text-3xl">Vikings vs {fixture.opponent}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 font-semibold">
            <p className="flex items-center gap-2"><CalendarDays size={18} aria-hidden="true" />{formatDate(`${fixture.date.slice(0, 10)}T12:00:00Z`)}</p>
            <p className="flex items-center gap-2"><Clock size={18} aria-hidden="true" />{fixture.kickoff} kickoff · UK time</p>
            <PitchLocation pitchLocation={fixture.pitchLocation} pitchAddress={fixture.pitchAddress} />
          </div>
        </>
      )}
      {!fixturesQuery.isLoading && !fixturesQuery.isError && changedFixtures.length > 0 && (
        <div className="mt-4 space-y-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {changedFixtures.map((entry) => (
            <p key={entry.id}>
              <strong>{entry.status === "postponed" ? "Postponed" : "Cancelled"}: Vikings vs {entry.opponent}</strong>
              {" "}— originally {formatDate(`${entry.date.slice(0, 10)}T12:00:00Z`)} at {entry.kickoff}.
              {" "}{entry.status === "postponed" ? "Not taking place as listed; ask your coach for the new date." : "Not taking place; do not travel for this fixture."}
            </p>
          ))}
        </div>
      )}
      {meta && (
        <div className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
          <p>Manually imported schedule · last updated {formatDate(meta.importedAt)}. Not a live feed—confirm any fixture changes or postponements with your coach.</p>
          {safeSourceUrl && (
            <a href={safeSourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 font-bold text-primary hover:underline">
              Check official fixture details <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </section>
  );
}
