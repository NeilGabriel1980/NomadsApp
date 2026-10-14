import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { and, asc, eq, sql } from "drizzle-orm";
import { db, seasonMatchEventsTable, seasonMatchesTable } from "@workspace/db";
import {
  CreateSeasonMatchBody,
  CreateSeasonMatchResponse,
  ListSeasonMatchesResponse,
  UpdateSeasonMatchBody,
} from "@workspace/api-zod";

const router: IRouter = Router();
const validSeasons = new Set(["2025/26", "2026/27"]);
const roster = new Set(["Noah", "Harry", "Freddie", "Alex", "Edward", "Olly", "Max", "Fredrick", "Will", "Sam"]);
const allowedGoalPlayers = new Set([...roster, "Own Goal (opp.)"]);
const allowedAwardPlayers = new Set([...roster, "Team"]);
const editorKeyHeader = "x-report-editor-key";
const matchVersionHeader = "x-match-version";
const activeSeason = "2026/27";

function requireEditorKey(req: Request, res: Response, next: NextFunction) {
  const expectedKey = process.env.REPORT_EDITOR_KEY;
  if (!expectedKey) {
    res.status(503).json({ error: "Report editor access is not configured." });
    return;
  }

  const suppliedKey = req.header(editorKeyHeader);
  if (!suppliedKey || suppliedKey !== expectedKey) {
    res.status(401).json({ error: "Invalid editor key." });
    return;
  }

  next();
}

function parseMatchId(value: string | string[]) {
  if (Array.isArray(value)) return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function cleanOptionalAward(value: string | null | undefined) {
  const cleaned = typeof value === "string" ? value.trim() : "";
  return cleaned || null;
}

function validateAndCleanInput(input: {
  season: string;
  matchDate: Date;
  competition: string;
  type: string;
  venue: string;
  opponent: string;
  vikingsGF: number;
  vikingsGA: number;
  motm: string;
  gotw: string | null;
  captain: string | null;
  goals: Array<{ player: string; goals: number }>;
  expectedVersion: number | null;
}) {
  const competition = input.competition.trim();
  const type = input.type.trim();
  const opponent = input.opponent.trim();
  const motm = input.motm.trim();
  const gotw = cleanOptionalAward(input.gotw);
  const captain = cleanOptionalAward(input.captain);

  if (!validSeasons.has(input.season)) throw new Error("A valid season is required.");
  if (input.season !== activeSeason) throw new Error("The completed 2025/26 season is read-only.");
  if (!competition || !type || !opponent) throw new Error("Competition, type and opponent are required.");
  if (input.venue !== "Home" && input.venue !== "Away") throw new Error("Venue must be Home or Away.");
  if (!Number.isInteger(input.vikingsGF) || input.vikingsGF < 0) throw new Error("Goals for must be a non-negative whole number.");
  if (!Number.isInteger(input.vikingsGA) || input.vikingsGA < 0) throw new Error("Goals against must be a non-negative whole number.");
  if (motm && !allowedAwardPlayers.has(motm)) throw new Error("Please choose a player or Team for MOTM.");
  if (gotw && !roster.has(gotw)) throw new Error("Please choose a squad player for Grafter of the Week.");
  if (captain && !roster.has(captain)) throw new Error("Please choose a squad player as captain.");

  const goals = input.goals
    .map((entry) => ({ player: entry.player.trim(), goals: entry.goals }))
    .filter((entry) => entry.player && entry.goals > 0);

  if (goals.some((entry) => !allowedGoalPlayers.has(entry.player))) {
    throw new Error("Goals can only be assigned to a squad player or opposition own goal.");
  }
  if (goals.some((entry) => !Number.isInteger(entry.goals) || entry.goals < 1 || entry.goals > 10)) {
    throw new Error("Each goal entry must be between 1 and 10.");
  }

  const goalsByPlayer = new Map<string, number>();
  for (const entry of goals) {
    goalsByPlayer.set(entry.player, (goalsByPlayer.get(entry.player) ?? 0) + entry.goals);
  }
  const totalLoggedGoals = Array.from(goalsByPlayer.values()).reduce((sum, value) => sum + value, 0);
  if (totalLoggedGoals !== input.vikingsGF) {
    throw new Error(`Goal entries total ${totalLoggedGoals}, but the Vikings score is ${input.vikingsGF}.`);
  }

  return {
    season: input.season,
    matchDate: input.matchDate.toISOString().slice(0, 10),
    competition,
    type,
    venue: input.venue,
    opponent,
    vikingsGF: input.vikingsGF,
    vikingsGA: input.vikingsGA,
    motm,
    gotw,
    captain,
    expectedVersion: input.expectedVersion,
    goals: Array.from(goalsByPlayer, ([player, quantity]) => ({ player, quantity })),
  };
}

async function responseForMatch(matchId: number, num: number) {
  const [match] = await db.select().from(seasonMatchesTable).where(eq(seasonMatchesTable.id, matchId));
  if (!match) return null;

  const events = await db
    .select()
    .from(seasonMatchEventsTable)
    .where(and(eq(seasonMatchEventsTable.matchId, matchId), eq(seasonMatchEventsTable.eventType, "goal")))
    .orderBy(asc(seasonMatchEventsTable.id));

  return CreateSeasonMatchResponse.parse({
    id: match.id,
    num,
    season: match.season,
    matchDate: match.matchDate,
    competition: match.competition,
    type: match.type,
    venue: match.venue,
    opponent: match.opponent,
    vikingsGF: match.vikingsGF,
    vikingsGA: match.vikingsGA,
    motm: match.motm,
    gotw: match.gotw,
    captain: match.captain,
    version: match.version,
    goals: events.map((event) => ({ player: event.player, goals: event.quantity })),
  });
}

async function nextMatchNumber(season: string) {
  const existing = await db
    .select({ id: seasonMatchesTable.id })
    .from(seasonMatchesTable)
    .where(eq(seasonMatchesTable.season, season));
  return existing.length + 1;
}

async function saveMatch(input: ReturnType<typeof validateAndCleanInput>, id?: number) {
  const savedId = await db.transaction(async (tx) => {
    let matchId = id;
    if (matchId) {
      if (!input.expectedVersion) return { status: "conflict" as const };
      const updated = await tx
        .update(seasonMatchesTable)
        .set({
          season: input.season,
          matchDate: input.matchDate,
          competition: input.competition,
          type: input.type,
          venue: input.venue,
          opponent: input.opponent,
          vikingsGF: input.vikingsGF,
          vikingsGA: input.vikingsGA,
          motm: input.motm,
          gotw: input.gotw,
          captain: input.captain,
          version: sql`${seasonMatchesTable.version} + 1`,
        })
        .where(and(
          eq(seasonMatchesTable.id, matchId),
          eq(seasonMatchesTable.season, activeSeason),
          eq(seasonMatchesTable.version, input.expectedVersion),
        ))
        .returning({ id: seasonMatchesTable.id });
      if (updated.length === 0) {
        const existing = await tx
          .select({ id: seasonMatchesTable.id })
          .from(seasonMatchesTable)
          .where(and(eq(seasonMatchesTable.id, matchId), eq(seasonMatchesTable.season, activeSeason)));
        return { status: existing.length ? "conflict" as const : "not-found" as const };
      }
    } else {
      if (input.expectedVersion !== null) return { status: "conflict" as const };
      const [created] = await tx
        .insert(seasonMatchesTable)
        .values({
          season: input.season,
          matchDate: input.matchDate,
          competition: input.competition,
          type: input.type,
          venue: input.venue,
          opponent: input.opponent,
          vikingsGF: input.vikingsGF,
          vikingsGA: input.vikingsGA,
          motm: input.motm,
          gotw: input.gotw,
          captain: input.captain,
        })
        .returning({ id: seasonMatchesTable.id });
      matchId = created.id;
    }

    await tx.delete(seasonMatchEventsTable).where(eq(seasonMatchEventsTable.matchId, matchId));
    if (input.goals.length > 0) {
      await tx.insert(seasonMatchEventsTable).values(
        input.goals.map((goal) => ({
          matchId: matchId as number,
          player: goal.player,
          eventType: "goal",
          quantity: goal.quantity,
        })),
      );
    }
    return { status: "saved" as const, id: matchId as number };
  });

  return savedId;
}

router.get("/season-matches", async (req, res) => {
  const season = typeof req.query.season === "string" ? req.query.season : "";
  if (!validSeasons.has(season)) {
    res.status(400).json({ error: "A valid season is required." });
    return;
  }

  const matches = await db
    .select()
    .from(seasonMatchesTable)
    .where(eq(seasonMatchesTable.season, season))
    .orderBy(asc(seasonMatchesTable.matchDate), asc(seasonMatchesTable.id));

  const responses = await Promise.all(matches.map((match, index) => responseForMatch(match.id, index + 1)));
  res.json(ListSeasonMatchesResponse.parse({ matches: responses.filter(Boolean) }));
});

router.post("/season-matches", requireEditorKey, async (req, res) => {
  const parsed = CreateSeasonMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the match details and try again." });
    return;
  }

  try {
    const input = validateAndCleanInput(parsed.data);
    const result = await saveMatch(input);
    if (result.status !== "saved") {
      res.status(409).json({ error: "The match changed before it could be saved. Refresh and try again." });
      return;
    }
    const id = result.id;
    const num = await nextMatchNumber(input.season) - 1;
    const response = id ? await responseForMatch(id, num) : null;
    if (!response) {
      res.status(500).json({ error: "The match could not be saved." });
      return;
    }
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Please check the match details and try again." });
  }
});

router.put("/season-matches/:id", requireEditorKey, async (req, res) => {
  const id = parseMatchId(req.params.id);
  if (!id) {
    res.status(404).json({ error: "Match not found." });
    return;
  }

  const parsed = UpdateSeasonMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the match details and try again." });
    return;
  }

  try {
    const input = validateAndCleanInput(parsed.data);
    const result = await saveMatch(input, id);
    if (result.status === "not-found") {
      res.status(404).json({ error: "Match not found." });
      return;
    }
    if (result.status === "conflict") {
      res.status(409).json({ error: "This match was changed elsewhere. Refresh the page before editing it again." });
      return;
    }
    const matches = await db
      .select({ id: seasonMatchesTable.id })
      .from(seasonMatchesTable)
      .where(eq(seasonMatchesTable.season, input.season))
      .orderBy(asc(seasonMatchesTable.matchDate), asc(seasonMatchesTable.id));
    const num = matches.findIndex((match) => match.id === id) + 1;
    const response = await responseForMatch(id, num);
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Please check the match details and try again." });
  }
});

router.delete("/season-matches/:id", requireEditorKey, async (req, res) => {
  const id = parseMatchId(req.params.id);
  if (!id) {
    res.status(404).json({ error: "Match not found." });
    return;
  }

  const version = Number(req.header(matchVersionHeader));
  if (!Number.isInteger(version) || version < 1) {
    res.status(409).json({ error: "A current match version is required. Refresh and try again." });
    return;
  }

  const deleted = await db
    .delete(seasonMatchesTable)
    .where(and(
      eq(seasonMatchesTable.id, id),
      eq(seasonMatchesTable.season, activeSeason),
      eq(seasonMatchesTable.version, version),
    ))
    .returning({ id: seasonMatchesTable.id });

  if (deleted.length === 0) {
    const existing = await db
      .select({ id: seasonMatchesTable.id })
      .from(seasonMatchesTable)
      .where(and(eq(seasonMatchesTable.id, id), eq(seasonMatchesTable.season, activeSeason)));
    res.status(existing.length ? 409 : 404).json({
      error: existing.length
        ? "This match was changed elsewhere. Refresh before deleting it."
        : "Match not found.",
    });
    return;
  }

  res.status(204).send();
});

export default router;