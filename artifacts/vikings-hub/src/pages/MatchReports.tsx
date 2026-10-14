import {
  getListMatchReportsQueryKey,
  useListMatchReports,
} from "@workspace/api-client-react";
import { CalendarDays, FileText } from "lucide-react";
import { useSeason } from "@/context/SeasonContext";
import { MatchReportDetails } from "@/components/MatchReportDetails";

export default function MatchReports() {
  const { seasonKey, matches, goalLog } = useSeason();
  const reportsQuery = useListMatchReports(
    { season: seasonKey },
    { query: { queryKey: getListMatchReportsQueryKey({ season: seasonKey }), staleTime: 30_000 } },
  );

  const reports = reportsQuery.data?.reports ?? [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-secondary text-secondary-foreground rounded-xl shadow-sm">
            <FileText size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-primary">Match Reports</h1>
        </div>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl">
          Weekly stories, standout moments and reflections from the {seasonKey} campaign.
        </p>
      </div>

      {reportsQuery.isLoading && (
        <div className="py-20 text-center text-muted-foreground font-bold">Loading match reports...</div>
      )}

      {reportsQuery.isError && (
        <div className="bg-card border-2 border-destructive/40 rounded-2xl p-8 text-center">
          <p className="font-bold text-destructive">Match reports could not be loaded.</p>
          <button onClick={() => reportsQuery.refetch()} className="mt-3 font-bold text-primary underline">Try again</button>
        </div>
      )}

      {!reportsQuery.isLoading && !reportsQuery.isError && reports.length === 0 && (
        <div className="bg-card border-2 border-dashed border-border rounded-3xl p-12 text-center">
          <CalendarDays className="mx-auto text-secondary mb-5" size={48} />
          <h2 className="text-2xl font-display font-bold mb-2">No match reports yet</h2>
          <p className="text-muted-foreground font-medium">The first weekly report will appear here after it is published.</p>
        </div>
      )}

      <div className="space-y-6">
        {reports.map((report) => {
          const enteredMatch = matches.find(
            (match) =>
              match.matchDate?.startsWith(report.matchDate.slice(0, 10)) &&
              match.opponent === report.opponent,
          );
          const shortScore =
            report.score ||
            (enteredMatch
              ? `Vikings ${enteredMatch.vikingsGF}–${enteredMatch.vikingsGA}`
              : "");
          const score =
            shortScore && !shortScore.toLowerCase().includes(report.opponent.toLowerCase())
              ? `${shortScore} ${report.opponent}`
              : shortScore;

          return (
          <article key={report.id} className="bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  <span>{formatMatchDate(report.matchDate)}</span>
                  <span aria-hidden="true">•</span>
                  <span>vs {report.opponent}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold text-primary">{report.title}</h2>
              </div>
              {score && (
                <div className="rounded-xl bg-secondary px-4 py-2 text-center font-display font-black text-secondary-foreground md:max-w-[40%]">
                  {score}
                </div>
              )}
            </div>

            {enteredMatch && (
              <MatchReportDetails
                match={enteredMatch}
                scorers={goalLog.filter((entry) => entry.matchNum === enteredMatch.num)}
              />
            )}

            <div className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/90">{report.body}</div>

          </article>
          );
        })}
      </div>
    </div>
  );
}

function formatMatchDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}