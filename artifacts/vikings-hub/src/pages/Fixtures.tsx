import { PitchLocation } from "@/components/PitchLocation";
import React from 'react';
import { useSeason } from '@/context/SeasonContext';
import { Link } from 'wouter';
import { ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { OFFICIAL_FIXTURES_URL } from '@/data/fixtures';
import { normalizeCompetition } from '@/data/competition';
import { useListFixtures, getListFixturesQueryKey, type Fixture } from '@workspace/api-client-react';

export default function Fixtures() {
  const { seasonKey, matches } = useSeason();
  const queryKey = getListFixturesQueryKey({ season: "2026/27" });
  const fixturesQuery = useListFixtures(
    { season: "2026/27" },
    { query: { queryKey, staleTime: 60_000, refetchInterval: 60_000 } }
  );

  if (seasonKey === "2025/26") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-card border-2 border-border rounded-3xl p-10 text-center shadow-sm">
          <Calendar className="mx-auto text-secondary mb-5 animate-pulse" size={48} />
          <h1 className="text-4xl font-display font-extrabold text-primary mb-3">Completed season</h1>
          <p className="text-lg text-muted-foreground font-medium mb-6">
            The 2025/26 fixtures are fully resolved. You can explore the final results in the Match History.
          </p>
          <Link href="/matches" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200">
            View 2025/26 Match History
          </Link>
        </div>
      </div>
    );
  }

  const fixtures = fixturesQuery.data?.fixtures || [];
  const meta = fixturesQuery.data?.importMeta;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-5xl font-display font-extrabold text-primary mb-3">Season Fixtures</h1>
          {fixturesQuery.isLoading ? (
            <div className="h-6 w-64 bg-muted animate-pulse rounded-md mt-2"></div>
          ) : meta ? (
            <p className="text-xl text-muted-foreground font-medium max-w-2xl">
              2026/27 {meta.sourceName} schedule. Snapshot imported on {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(meta.importedAt))}.
            </p>
          ) : (
             <p className="text-xl text-muted-foreground font-medium max-w-2xl">
              2026/27 season schedule.
            </p>
          )}
        </div>
        {meta?.sourceUrl ? (
          <a
            href={meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 font-bold text-secondary-foreground shadow-sm hover:bg-secondary/90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200"
          >
            <ExternalLink size={19} />
            Official {meta.sourceName} Source
          </a>
        ) : (
          <a
            href={OFFICIAL_FIXTURES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 font-bold text-secondary-foreground shadow-sm hover:bg-secondary/90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200"
          >
            <ExternalLink size={19} />
            Official FA Source
          </a>
        )}
      </div>

      <p className="mb-6 text-sm font-medium text-muted-foreground">
        Manually imported schedule, not a live feed. Confirm any fixture changes with your coach.
      </p>
      {fixturesQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-36 bg-card rounded-2xl animate-pulse border-2 border-border"></div>
          ))}
        </div>
      ) : fixturesQuery.isError ? (
        <div className="bg-destructive/10 text-destructive border-2 border-destructive/20 rounded-2xl p-8 text-center font-bold">
          Failed to load fixtures.
        </div>
      ) : fixtures.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground font-bold">
          No fixtures have been published for this season yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fixtures.map((fixture, idx) => {
            const isEntered = matches.some(
              (m) => m.opponent === fixture.opponent && m.matchDate?.startsWith(fixture.date)
            );

            return (
              <FixtureCard
                key={fixture.id}
                fixture={fixture}
                isEntered={isEntered}
                delay={Math.min(idx * 50, 800)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function FixtureCard({ fixture, isEntered, delay }: { fixture: Fixture; isEntered: boolean; delay: number }) {
  const status = fixture.status ?? "scheduled";
  const isScheduled = status === "scheduled";
  const dateObj = new Date(`${fixture.date.slice(0, 10)}T12:00:00`);
  const dateFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(dateObj);

  return (
    <div 
      className={`group border-2 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 animate-in zoom-in-95 fill-mode-both ${
        isEntered 
          ? "bg-card border-border opacity-60 hover:opacity-80" 
          : "bg-card border-primary/20 hover:border-primary shadow-sm hover:shadow-lg hover:-translate-y-1"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm bg-muted text-foreground px-3 py-1 rounded-md">
            {normalizeCompetition(fixture.competition)}
          </span>
          <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            {isScheduled ? `${dateFormatted} · ${fixture.kickoff}` : `Originally ${dateFormatted} · ${fixture.kickoff}`}
          </span>
        </div>
        {isEntered && isScheduled && (
          <div className="flex items-center gap-1.5 text-primary text-sm font-bold bg-primary/10 px-2 py-1 rounded-md">
            <CheckCircle2 size={16} /> Played
          </div>
        )}
      </div>

      {!isScheduled && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          <strong>{status === "postponed" ? "Postponed" : "Cancelled"}</strong>
          <p>{status === "postponed"
            ? "This match will not take place at the listed date and time. A new date is to be confirmed by your coach."
            : "This match will not take place. Do not travel for this fixture."}</p>
        </div>
      )}
      <div className="flex-1 flex flex-col gap-2 mt-2 relative">
        <div className="absolute left-2.5 top-5 bottom-5 w-0.5 bg-border rounded-full" />
        
        <div className={`font-display text-lg font-bold flex items-center justify-between pl-6 relative ${fixture.venue === "Home" ? "text-primary" : "text-foreground"}`}>
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-current shadow-sm" />
          <span>{fixture.homeTeam}</span>
        </div>
        
        <div className={`font-display text-lg font-bold flex items-center justify-between pl-6 relative ${fixture.venue === "Away" ? "text-primary" : "text-foreground"}`}>
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-current shadow-sm" />
          <span>{fixture.awayTeam}</span>
        </div>
      </div>
      {isScheduled && <PitchLocation pitchLocation={fixture.pitchLocation} pitchAddress={fixture.pitchAddress} />}
      {fixture.sourceUrl && (
        <a
          href={fixture.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          View fixture on source
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
