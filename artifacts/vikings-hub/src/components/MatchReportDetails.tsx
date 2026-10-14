import type { GoalLogEntry, Match } from "@/data/season";

export function MatchReportDetails({ match, scorers }: { match: Match; scorers: GoalLogEntry[] }) {
  const awards = [
    { label: "Captain", player: match.captain },
    { label: "Man of the Match", player: match.motm === "—" ? null : match.motm },
    { label: "Grafter of the Week", player: match.gotw },
  ].filter((award) => award.player);

  return (
    <section aria-label="Match scorers and awards" className="mb-6 rounded-2xl border border-secondary/30 bg-secondary/10 p-4 md:p-5">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Vikings scorers</h3>
      {scorers.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {scorers.map((scorer) => (
            <li key={scorer.player} className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold">
              {scorer.player === "Own Goal (opp.)" ? "Opposition own goal" : scorer.player}
              <span className="ml-2 text-primary">{scorer.goals} {scorer.goals === 1 ? "goal" : "goals"}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm font-medium text-muted-foreground">
          {match.vikingsGF === 0 ? "No Vikings goals." : "Scorer details have not been recorded."}
        </p>
      )}
      {awards.length > 0 && (
        <dl className="mt-4 grid gap-3 border-t border-secondary/30 pt-4 sm:grid-cols-3">
          {awards.map((award) => (
            <div key={award.label}>
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{award.label}</dt>
              <dd className="mt-1 font-display text-lg font-bold text-primary">{award.player}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
