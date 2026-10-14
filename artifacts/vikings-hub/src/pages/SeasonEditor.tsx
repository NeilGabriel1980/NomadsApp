import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListSeasonMatchesQueryKey,
  getListMatchReportsQueryKey,
  getListFixturesQueryKey,
  deleteSeasonMatch,
  deleteMatchReport,
  useCreateSeasonMatch,
  useCreateMatchReport,
  useListSeasonMatches,
  useListMatchReports,
  useUpdateMatchReport,
  useUpdateSeasonMatch,
  useListFixtures,
  usePreviewFixtureImport,
  useReplaceFixtures,
  type SeasonMatch,
  type SeasonMatchInput,
  type FixtureImportPreview,
  type FixtureInput,
} from "@workspace/api-client-react";
import { Edit3, LockKeyhole, Plus, Save, Trash2, X, UploadCloud, CheckCircle2, AlertTriangle } from "lucide-react";
import { useSeason } from "@/context/SeasonContext";
import { OFFICIAL_FIXTURES_URL } from "@/data/fixtures";
import { normalizeCompetition } from "@/data/competition";

const TEAM_PLAYERS = ["Noah", "Harry", "Freddie", "Alex", "Edward", "Olly", "Max", "Fredrick", "Will", "Sam"] as const;
const GOAL_PLAYERS = [...TEAM_PLAYERS, "Own Goal (opp.)"] as const;
const EDITOR_HEADER = "x-report-editor-key";

function todayForInput() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

type FormState = {
  matchDate: string;
  competition: string;
  type: string;
  venue: "Home" | "Away";
  opponent: string;
  vikingsGF: number;
  vikingsGA: number;
  motm: string;
  gotw: string;
  captain: string;
  goals: Record<string, number>;
};

function emptyForm(): FormState {
  return {
    matchDate: todayForInput(),
    competition: "",
    type: "League",
    venue: "Home",
    opponent: "",
    vikingsGF: 0,
    vikingsGA: 0,
    motm: "",
    gotw: "",
    captain: "",
    goals: Object.fromEntries(GOAL_PLAYERS.map((player) => [player, 0])),
  };
}

export default function SeasonEditor() {
  const { seasonKey } = useSeason();
  const queryClient = useQueryClient();
  const [editorKey, setEditorKey] = React.useState(() => sessionStorage.getItem("vikings-report-editor-key") ?? "");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editingVersion, setEditingVersion] = React.useState<number | null>(null);
  const [selectedFixtureId, setSelectedFixtureId] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [message, setMessage] = React.useState("");

  const [reportDate, setReportDate] = React.useState(todayForInput);
  const [editingReportId, setEditingReportId] = React.useState<number | null>(null);
  const [reportMatchId, setReportMatchId] = React.useState("");
  const [reportOpponent, setReportOpponent] = React.useState("");
  const [reportScore, setReportScore] = React.useState("");
  const [reportTitle, setReportTitle] = React.useState("");
  const [reportBody, setReportBody] = React.useState("");
  const [reportMessage, setReportMessage] = React.useState("");
  const [isDeletingReport, setIsDeletingReport] = React.useState(false);

  const [importText, setImportText] = React.useState("");
  const [importPreview, setImportPreview] = React.useState<FixtureImportPreview | null>(null);
  const [importSourceName, setImportSourceName] = React.useState("FA Full-Time");
  const [importSourceUrl, setImportSourceUrl] = React.useState(OFFICIAL_FIXTURES_URL);
  const [importMessage, setImportMessage] = React.useState("");

  const queryKey = getListSeasonMatchesQueryKey({ season: "2026/27" });
  const reportsQueryKey = getListMatchReportsQueryKey({ season: "2026/27" });
  const fixturesQueryKey = getListFixturesQueryKey({ season: "2026/27" });

  const matchesQuery = useListSeasonMatches(
    { season: "2026/27" },
    { query: { queryKey, staleTime: 30_000 } },
  );
  const reportsQuery = useListMatchReports(
    { season: "2026/27" },
    { query: { queryKey: reportsQueryKey, staleTime: 30_000 } },
  );
  const fixturesQuery = useListFixtures(
    { season: "2026/27" },
    { query: { queryKey: fixturesQueryKey, staleTime: 30_000 } }
  );

  const request = { headers: { [EDITOR_HEADER]: editorKey } };
  const createMatch = useCreateSeasonMatch({ request });
  const updateMatch = useUpdateSeasonMatch({ request });
  const createReport = useCreateMatchReport({ request });
  const updateReport = useUpdateMatchReport({ request });
  const previewImport = usePreviewFixtureImport({ request });
  const publishFixtures = useReplaceFixtures({ request });

  const isSaving = createMatch.isPending || updateMatch.isPending;

  React.useEffect(() => {
    if (editorKey) sessionStorage.setItem("vikings-report-editor-key", editorKey);
    else sessionStorage.removeItem("vikings-report-editor-key");
  }, [editorKey]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateGoal(player: string, goals: number) {
    setForm((current) => ({
      ...current,
      goals: { ...current.goals, [player]: Math.max(0, goals || 0) },
    }));
  }

  function resetForm() {
    setEditingId(null);
    setEditingVersion(null);
    setSelectedFixtureId("");
    setForm(emptyForm());
  }

  function handleFixtureSelect(fixtureId: string) {
    setSelectedFixtureId(fixtureId);
    if (!fixtureId) return;
    const fixture = fixturesQuery.data?.fixtures.find(f => String(f.id) === fixtureId);
    if (!fixture) return;
    setForm(current => ({
      ...current,
      matchDate: fixture.date.slice(0, 10),
      competition: normalizeCompetition(fixture.competition),
      type: "League",
      venue: fixture.venue,
      opponent: fixture.opponent,
    }));
  }

  function startEditing(match: SeasonMatch) {
    setSelectedFixtureId("");
    const goals = Object.fromEntries(GOAL_PLAYERS.map((player) => [player, 0]));
    for (const entry of match.goals) goals[entry.player] = entry.goals;
    setEditingId(match.id);
    setEditingVersion(match.version);
    setForm({
      matchDate: match.matchDate.slice(0, 10),
      competition: normalizeCompetition(match.competition),
      type: match.type,
      venue: match.venue,
      opponent: match.opponent,
      vikingsGF: match.vikingsGF,
      vikingsGA: match.vikingsGA,
      motm: match.motm,
      gotw: match.gotw ?? "",
      captain: match.captain ?? "",
      goals,
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const loggedGoals = Object.values(form.goals).reduce((sum, goals) => sum + goals, 0);
    if (loggedGoals !== form.vikingsGF) {
      setMessage(`Player goals add up to ${loggedGoals}. They must match the Vikings score of ${form.vikingsGF}.`);
      return;
    }

    const data: SeasonMatchInput = {
      season: "2026/27",
      matchDate: form.matchDate,
      competition: normalizeCompetition(form.competition),
      type: form.type,
      venue: form.venue,
      opponent: form.opponent,
      vikingsGF: form.vikingsGF,
      vikingsGA: form.vikingsGA,
      motm: form.motm,
      gotw: form.gotw || null,
      captain: form.captain || null,
      goals: Object.entries(form.goals)
        .filter(([, goals]) => goals > 0)
        .map(([player, goals]) => ({ player, goals })),
      expectedVersion: editingId ? editingVersion : null,
    };

    try {
      if (editingId) await updateMatch.mutateAsync({ id: editingId, data });
      else await createMatch.mutateAsync({ data });
      await queryClient.invalidateQueries({ queryKey });
      setMessage(editingId ? "Match updated. All season stats have been recalculated." : "Match added. All season stats have been recalculated.");
      resetForm();
    } catch (error) {
      await queryClient.invalidateQueries({ queryKey });
      setMessage(error instanceof Error ? error.message : "The match could not be saved. Check your editor key and details.");
    }
  }

  async function handleDelete(match: SeasonMatch) {
    if (!window.confirm(`Delete Match ${match.num} against ${match.opponent}? This will also remove its goals and awards.`)) return;
    setMessage("");
    setIsDeleting(true);
    try {
      await deleteSeasonMatch(match.id, {
        headers: {
          [EDITOR_HEADER]: editorKey,
          "x-match-version": String(match.version),
        },
      });
      await queryClient.invalidateQueries({ queryKey });
      if (editingId === match.id) resetForm();
      setMessage("Match deleted. All season stats have been recalculated.");
    } catch (error) {
      await queryClient.invalidateQueries({ queryKey });
      setMessage(error instanceof Error ? error.message : "The match could not be deleted. Check your editor key.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleReportSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReportMessage("");
    try {
      const reportData = {
        season: "2026/27" as const,
        matchDate: reportDate,
        opponent: reportOpponent,
        score: reportScore,
        title: reportTitle,
        body: reportBody,
      };
      if (editingReportId) {
        await updateReport.mutateAsync({ id: editingReportId, data: reportData });
      } else {
        await createReport.mutateAsync({
          data: reportData,
        });
      }
      await queryClient.invalidateQueries({ queryKey: reportsQueryKey });
      const wasEditing = Boolean(editingReportId);
      setEditingReportId(null);
      setReportMatchId("");
      setReportOpponent("");
      setReportScore("");
      setReportTitle("");
      setReportBody("");
      setReportMessage(wasEditing ? "Report updated." : "Report published.");
    } catch (error) {
      setReportMessage(error instanceof Error ? error.message : "The report could not be saved. Check your editor key.");
    }
  }

  function startEditingReport(report: NonNullable<typeof reportsQuery.data>["reports"][number]) {
    const enteredMatch = matchesQuery.data?.matches.find(
      (match) =>
        match.matchDate.slice(0, 10) === report.matchDate.slice(0, 10) &&
        match.opponent === report.opponent,
    );
    setEditingReportId(report.id);
    setReportMatchId("");
    setReportDate(report.matchDate.slice(0, 10));
    setReportOpponent(report.opponent);
    setReportScore(
      report.score ||
        (enteredMatch
          ? `Vikings ${enteredMatch.vikingsGF}–${enteredMatch.vikingsGA}`
          : ""),
    );
    setReportTitle(report.title);
    setReportBody(report.body);
    setReportMessage("");
    document.getElementById("match-report-editor")?.scrollIntoView({ behavior: "smooth" });
  }

  function cancelEditingReport() {
    setEditingReportId(null);
    setReportDate(todayForInput());
    setReportMatchId("");
    setReportOpponent("");
    setReportScore("");
    setReportTitle("");
    setReportBody("");
    setReportMessage("");
  }

  function handleReportMatchSelect(matchId: string) {
    setReportMatchId(matchId);
    const match = matchesQuery.data?.matches.find((entry) => String(entry.id) === matchId);
    if (!match) return;
    setReportDate(match.matchDate.slice(0, 10));
    setReportOpponent(match.opponent);
    setReportScore(`Vikings ${match.vikingsGF}–${match.vikingsGA}`);
  }

  async function handleReportDelete(reportId: number, title: string) {
    if (!window.confirm(`Delete "${title}"?`)) return;
    setReportMessage("");
    setIsDeletingReport(true);
    try {
      await deleteMatchReport(reportId, { headers: { [EDITOR_HEADER]: editorKey } });
      await queryClient.invalidateQueries({ queryKey: reportsQueryKey });
      setReportMessage("Report deleted.");
    } catch (error) {
      setReportMessage(error instanceof Error ? error.message : "The report could not be deleted. Check your editor key.");
    } finally {
      setIsDeletingReport(false);
    }
  }

  async function handlePreviewImport() {
    setImportMessage("");
    try {
      const result = await previewImport.mutateAsync({ data: { text: importText } });
      setImportPreview(result);
    } catch (error) {
      setImportPreview(null);
      setImportMessage(error instanceof Error ? error.message : "Failed to preview fixtures.");
    }
  }

  async function handlePublishFixtures() {
    if (!importPreview) return;
    setImportMessage("");
    try {
      await publishFixtures.mutateAsync({
        data: {
          season: "2026/27",
          sourceName: importSourceName,
          sourceUrl: importSourceUrl,
          fixtures: importPreview.fixtures
        }
      });
      await queryClient.invalidateQueries({ queryKey: fixturesQueryKey });
      setImportMessage("Fixtures successfully published!");
      setImportText("");
      setImportPreview(null);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Failed to publish fixtures. Check your editor key.");
    }
  }

  function handleEditPublishedFixtures() {
    if (!fixturesQuery.data) return;
    setImportPreview({ fixtures: fixturesQuery.data.fixtures, warnings: [] });
    setImportSourceName(fixturesQuery.data.importMeta.sourceName);
    setImportSourceUrl(fixturesQuery.data.importMeta.sourceUrl);
    setImportMessage("");
  }

  function updatePitchDetails(index: number, field: "pitchLocation" | "pitchAddress", value: string) {
    setImportPreview((preview) => preview && ({
      ...preview,
      fixtures: preview.fixtures.map((fixture, i) => i === index ? { ...fixture, [field]: value } : fixture),
    }));
  }

  function updateFixtureStatus(index: number, status: FixtureInput["status"]) {
    setImportPreview((preview) => preview && ({
      ...preview,
      fixtures: preview.fixtures.map((fixture, i) => i === index ? { ...fixture, status } : fixture),
    }));
  }

  if (seasonKey === "2025/26") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-card border-2 border-border rounded-3xl p-10 text-center shadow-sm">
          <LockKeyhole className="mx-auto text-secondary mb-5" size={48} />
          <h1 className="text-4xl font-display font-extrabold text-primary mb-3">Completed season</h1>
          <p className="text-lg text-muted-foreground font-medium">The 2025/26 history is preserved as a completed record. Select the 2026/27 season above to add new results and statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-primary mb-3">Add Match & Stats</h1>
        <p className="text-xl text-muted-foreground font-medium">Enter one result and the hub updates every 2026/27 leaderboard and player statistic automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-7 mb-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-display font-bold">{editingId ? "Edit match" : "New match"}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 font-bold text-muted-foreground hover:text-primary">
              <X size={18} /> Cancel edit
            </button>
          )}
        </div>

        <div>
          <label htmlFor="stats-editor-key" className="field-label">Private editor key</label>
          <input
            type="text"
            name="username"
            autoComplete="username"
            value="season-stats-editor"
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          />
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input id="stats-editor-key" type="password" required autoComplete="current-password" value={editorKey} onChange={(event) => setEditorKey(event.target.value)} className="form-input pl-12" placeholder="Enter your editor key" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">The same key is used for match reports and is saved only for this browser tab.</p>
        </div>

        {!editingId && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
            <Field label="Prefill from scheduled fixture" id="fixture-selector">
              <select
                id="fixture-selector"
                onChange={(e) => handleFixtureSelect(e.target.value)}
                className="form-input bg-background"
                value={selectedFixtureId}
                disabled={fixturesQuery.isLoading}
              >
                <option value="">{fixturesQuery.isLoading ? "Loading fixtures..." : "Select a fixture to prefill..."}</option>
                {fixturesQuery.data?.fixtures.map(f => {
                   const dateFormatted = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(f.date));
                   return <option key={f.id} value={f.id}>{dateFormatted} vs {f.opponent} ({f.venue})</option>
                })}
              </select>
            </Field>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Field label="Match date" id="entry-date">
            <input id="entry-date" type="date" required value={form.matchDate} onChange={(event) => updateField("matchDate", event.target.value)} className="form-input" />
          </Field>
          <Field label="Competition" id="entry-competition">
            <input id="entry-competition" required maxLength={120} value={form.competition} onChange={(event) => updateField("competition", event.target.value)} className="form-input" placeholder="e.g. Division 4" />
          </Field>
          <Field label="Match type" id="entry-type">
            <select id="entry-type" value={form.type} onChange={(event) => updateField("type", event.target.value)} className="form-input">
              <option>League</option><option>Friendly</option><option>Cup</option><option>Final</option>
            </select>
          </Field>
          <Field label="Venue" id="entry-venue">
            <select id="entry-venue" value={form.venue} onChange={(event) => updateField("venue", event.target.value as "Home" | "Away")} className="form-input">
              <option value="Home">Home</option><option value="Away">Away</option>
            </select>
          </Field>
        </div>

        <div className="grid md:grid-cols-[1fr_140px_140px] gap-5">
          <Field label="Opponent" id="entry-opponent">
            <input id="entry-opponent" required maxLength={120} value={form.opponent} onChange={(event) => updateField("opponent", event.target.value)} className="form-input" placeholder="e.g. West Kirby" />
          </Field>
          <Field label="Vikings goals" id="entry-gf">
            <input id="entry-gf" type="number" required min={0} max={99} value={form.vikingsGF} onChange={(event) => updateField("vikingsGF", Number(event.target.value))} className="form-input" />
          </Field>
          <Field label="Opponent goals" id="entry-ga">
            <input id="entry-ga" type="number" required min={0} max={99} value={form.vikingsGA} onChange={(event) => updateField("vikingsGA", Number(event.target.value))} className="form-input" />
          </Field>
        </div>

        <div>
          <h3 className="text-xl font-display font-bold mb-1">Who scored?</h3>
          <p className="text-sm text-muted-foreground mb-4">Enter each player's goals. Use Opposition own goal when one counted for the Vikings.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {GOAL_PLAYERS.map((player) => (
              <label key={player} className="bg-muted/60 border border-border rounded-xl p-3">
                <span className="block text-sm font-bold mb-2">{player === "Own Goal (opp.)" ? "Opposition own goal" : player}</span>
                <input type="number" min={0} max={10} value={form.goals[player] ?? 0} onChange={(event) => updateGoal(player, Number(event.target.value))} className="form-input py-2" aria-label={`${player} goals`} />
              </label>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <Field label="Man of the Match" id="entry-motm">
            <select id="entry-motm" value={form.motm} onChange={(event) => updateField("motm", event.target.value)} className="form-input">
              <option value="">No award selected</option>
              {TEAM_PLAYERS.map((player) => <option key={player}>{player}</option>)}
              <option>Team</option>
            </select>
          </Field>
          <Field label="Grafter of the Week" id="entry-gotw">
            <select id="entry-gotw" value={form.gotw} onChange={(event) => updateField("gotw", event.target.value)} className="form-input">
              <option value="">No award selected</option>
              {TEAM_PLAYERS.map((player) => <option key={player}>{player}</option>)}
            </select>
          </Field>
          <Field label="Captain" id="entry-captain">
            <select id="entry-captain" value={form.captain} onChange={(event) => updateField("captain", event.target.value)} className="form-input">
              <option value="">No captain selected</option>
              {TEAM_PLAYERS.map((player) => <option key={player}>{player}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60">
            {editingId ? <Save size={19} /> : <Plus size={19} />}
            {isSaving ? "Saving..." : editingId ? "Save changes" : "Add match and update stats"}
          </button>
          {message && <p className="font-bold text-muted-foreground max-w-xl">{message}</p>}
        </div>
      </form>

      <section>
        <h2 className="text-3xl font-display font-bold mb-5">Entered matches</h2>
        {matchesQuery.isLoading && <p className="text-muted-foreground font-bold">Loading matches...</p>}
        {matchesQuery.data?.matches.length === 0 && <div className="bg-card border-2 border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground font-bold">No matches entered yet.</div>}
        <div className="space-y-3">
          {matchesQuery.data?.matches.map((match) => (
            <div key={match.id} className="bg-card border-2 border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Match {match.num} · {match.matchDate.slice(0, 10)} · {normalizeCompetition(match.competition)}</div>
                <div className="text-xl font-display font-bold mt-1">Vikings {match.vikingsGF}–{match.vikingsGA} {match.opponent}</div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => startEditing(match)} className="inline-flex items-center gap-2 font-bold text-primary hover:underline"><Edit3 size={17} /> Edit</button>
                <button type="button" onClick={() => handleDelete(match)} disabled={isDeleting} className="inline-flex items-center gap-2 font-bold text-destructive hover:underline disabled:opacity-60"><Trash2 size={17} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="match-report-editor" className="mt-12">
        <div className="mb-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-display font-bold">{editingReportId ? "Edit post-match report" : "Post-match report"}</h2>
            {editingReportId && (
              <button type="button" onClick={cancelEditingReport} className="inline-flex items-center gap-2 font-bold text-muted-foreground hover:text-primary">
                <X size={18} /> Cancel edit
              </button>
            )}
          </div>
          <p className="text-muted-foreground font-medium mt-1">Reports are hidden from the public editor controls and appear on the public Reports page after publishing.</p>
        </div>
        <form onSubmit={handleReportSubmit} className="bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          {!editingReportId && <Field label="Select an entered match" id="report-match">
            <select id="report-match" value={reportMatchId} onChange={(event) => handleReportMatchSelect(event.target.value)} className="form-input">
              <option value="">Enter report details manually</option>
              {matchesQuery.data?.matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.matchDate.slice(0, 10)} · Vikings {match.vikingsGF}–{match.vikingsGA} {match.opponent}
                </option>
              ))}
            </select>
          </Field>}
          {!editingReportId && matchesQuery.data?.matches.length === 0 && (
            <p className="text-sm font-medium text-muted-foreground">Add the match result first and it will become available here for automatic pre-filling.</p>
          )}
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Match date" id="report-date">
              <input id="report-date" type="date" required value={reportDate} onChange={(event) => setReportDate(event.target.value)} className="form-input" />
            </Field>
            <Field label="Opponent" id="report-opponent">
              <input id="report-opponent" required maxLength={120} value={reportOpponent} onChange={(event) => setReportOpponent(event.target.value)} className="form-input" placeholder="e.g. West Kirby" />
            </Field>
            <Field label="Score (optional)" id="report-score">
              <input id="report-score" maxLength={30} value={reportScore} onChange={(event) => setReportScore(event.target.value)} className="form-input" placeholder="e.g. Vikings 4–2 West Kirby" />
            </Field>
            <Field label="Headline" id="report-title">
              <input id="report-title" required maxLength={160} value={reportTitle} onChange={(event) => setReportTitle(event.target.value)} className="form-input" placeholder="A memorable morning for the Vikings" />
            </Field>
          </div>
          <Field label="Match report" id="report-body">
            <textarea id="report-body" required maxLength={10_000} rows={8} value={reportBody} onChange={(event) => setReportBody(event.target.value)} className="form-input resize-y" placeholder="Write your weekly match report here..." />
          </Field>
          <div className="flex flex-wrap items-center gap-4">
             <button type="submit" disabled={createReport.isPending || updateReport.isPending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60">
               {editingReportId ? <Save size={19} /> : <Plus size={19} />} {createReport.isPending || updateReport.isPending ? "Saving..." : editingReportId ? "Save report changes" : "Publish report"}
            </button>
            {reportMessage && <p className="font-bold text-muted-foreground">{reportMessage}</p>}
          </div>
        </form>

        <div className="space-y-3 mt-5">
          {reportsQuery.data?.reports.map((report) => (
            <div key={report.id} className="bg-card border-2 border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{report.matchDate.slice(0, 10)} · {report.opponent}</div>
                <div className="text-xl font-display font-bold mt-1">{report.title}</div>
              </div>
               <div className="flex gap-4">
                 <button type="button" onClick={() => startEditingReport(report)} className="inline-flex items-center gap-2 self-start sm:self-auto font-bold text-primary hover:underline">
                   <Edit3 size={17} /> Edit
                 </button>
                 <button type="button" onClick={() => handleReportDelete(report.id, report.title)} disabled={isDeletingReport} className="inline-flex items-center gap-2 self-start sm:self-auto font-bold text-destructive hover:underline disabled:opacity-60">
                   <Trash2 size={17} /> Delete
                 </button>
               </div>
            </div>
          ))}
        </div>
      </section>

      <section id="fixture-importer" className="mt-12">
        <div className="mb-5">
          <h2 className="text-3xl font-display font-bold">Import fixtures</h2>
          <p className="text-muted-foreground font-medium mt-1">Paste tabular data directly from FA Full-Time or your spreadsheet. This replaces the entire fixture list.</p>
        </div>
        <div className="bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Source Name" id="import-source-name">
              <input id="import-source-name" required maxLength={160} value={importSourceName} onChange={(event) => setImportSourceName(event.target.value)} className="form-input" placeholder="e.g. FA Full-Time" />
            </Field>
            <Field label="Source URL" id="import-source-url">
              <input id="import-source-url" required maxLength={1000} value={importSourceUrl} onChange={(event) => setImportSourceUrl(event.target.value)} className="form-input" placeholder="e.g. https://fulltime.thefa.com/..." />
            </Field>
          </div>
          <Field label="Paste Fixtures Data" id="import-text">
            <textarea id="import-text" required rows={6} value={importText} onChange={(event) => {
              setImportText(event.target.value);
              setImportPreview(null);
            }} className="form-input resize-y font-mono text-sm" placeholder="Paste tab or comma separated data..." />
          </Field>
          <p className="text-sm text-muted-foreground">
            Columns: Date, Time, Home team, Away team, Competition, optional fixture URL, optional Pitch location, optional Pitch address, optional Status (scheduled, postponed or cancelled).
            Use tabs or pipes, or put CSV addresses containing commas in double quotes. You can also enter pitch details below after previewing.
            Leave unknown addresses blank so parents are told to confirm with coach.
            Older imports without a status are treated as scheduled. Review statuses before publishing a replacement schedule.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={handlePreviewImport} disabled={previewImport.isPending || !importText.trim()} className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 font-bold text-secondary-foreground shadow-sm hover:bg-secondary/90 disabled:opacity-60">
              <UploadCloud size={19} />
              {previewImport.isPending ? "Parsing..." : "Preview imported fixtures"}
            </button>
            <button type="button" onClick={handleEditPublishedFixtures} disabled={!fixturesQuery.data || previewImport.isPending || publishFixtures.isPending} className="rounded-xl border-2 border-border px-6 py-3 font-bold text-primary hover:bg-muted disabled:opacity-60">
              Edit published statuses & pitch details
            </button>
            {importMessage && !importPreview && <p className="font-bold text-muted-foreground">{importMessage}</p>}
          </div>

          {importPreview && (
            <div className="mt-8 border-t-2 border-border pt-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-bold">Preview ({importPreview.fixtures.length} fixtures found)</h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">Review required</span>
              </div>

              {importPreview.warnings.length > 0 && (
                <div className="mb-5 bg-chart-5/10 border border-chart-5/30 text-chart-5 rounded-xl p-4">
                  <h4 className="font-bold flex items-center gap-2 mb-2"><AlertTriangle size={18} /> Warnings</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {importPreview.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              <div className="max-h-80 overflow-y-auto bg-background rounded-xl border-2 border-border mb-6">
                <table className="w-full text-sm text-left">
                  <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm shadow-sm z-10">
                    <tr>
                      <th className="px-4 py-3 font-bold text-muted-foreground border-b-2 border-border">Date</th>
                      <th className="px-4 py-3 font-bold text-muted-foreground border-b-2 border-border">Kickoff</th>
                      <th className="px-4 py-3 font-bold text-muted-foreground border-b-2 border-border">Home</th>
                      <th className="px-4 py-3 font-bold text-muted-foreground border-b-2 border-border">Away</th>
                      <th className="px-4 py-3 font-bold text-muted-foreground border-b-2 border-border">Competition</th>
                      <th className="px-4 py-3 font-bold text-muted-foreground border-b-2 border-border">Status</th>
                      <th className="px-4 py-3 font-bold text-muted-foreground border-b-2 border-border">Pitch location (optional)</th>
                      <th className="px-4 py-3 font-bold text-muted-foreground border-b-2 border-border">Pitch address (optional)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.fixtures.map((f, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-foreground">
                          {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${f.date.slice(0, 10)}T12:00:00`))}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{f.kickoff}</td>
                        <td className="px-4 py-3 font-medium">{f.homeTeam}</td>
                        <td className="px-4 py-3 font-medium">{f.awayTeam}</td>
                        <td className="px-4 py-3 text-muted-foreground">{normalizeCompetition(f.competition)}</td>
                        <td className="px-4 py-3">
                          <select aria-label={`Status for ${f.date.slice(0, 10)} ${f.homeTeam} vs ${f.awayTeam}`} value={f.status ?? "scheduled"} onChange={(event) => updateFixtureStatus(i, event.target.value as FixtureInput["status"])} disabled={publishFixtures.isPending} className="form-input min-w-40">
                            <option value="scheduled">Scheduled</option>
                            <option value="postponed">Postponed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input aria-label={`Pitch location for ${f.date.slice(0, 10)} ${f.homeTeam} vs ${f.awayTeam}`} maxLength={160} value={f.pitchLocation ?? ""} onChange={(event) => updatePitchDetails(i, "pitchLocation", event.target.value)} disabled={publishFixtures.isPending} className="form-input min-w-44" placeholder="e.g. Main pitch" />
                        </td>
                        <td className="px-4 py-3">
                          <textarea aria-label={`Pitch address for ${f.date.slice(0, 10)} ${f.homeTeam} vs ${f.awayTeam}`} maxLength={500} rows={2} value={f.pitchAddress ?? ""} onChange={(event) => updatePitchDetails(i, "pitchAddress", event.target.value)} disabled={publishFixtures.isPending} className="form-input min-w-56 resize-y" placeholder="Full address and postcode" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
                <button type="button" onClick={handlePublishFixtures} disabled={publishFixtures.isPending || importPreview.fixtures.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:hover:translate-y-0">
                  <CheckCircle2 size={19} /> {publishFixtures.isPending ? "Publishing..." : "Publish fixtures"}
                </button>
                {importMessage && <p className="font-bold text-primary">{importMessage}</p>}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="field-label">{label}</label>{children}</div>;
}
