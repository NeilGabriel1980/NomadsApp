import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { asc, desc, eq } from "drizzle-orm";
import { db, fixtureImportsTable, fixturesTable } from "@workspace/db";
import {
  ListFixturesResponse,
  PreviewFixtureImportBody,
  PreviewFixtureImportResponse,
  ReplaceFixturesBody,
} from "@workspace/api-zod";

const router: IRouter = Router();
const TEAM_NAME = "Neston Nomads U9 Vikings";
const SEASON = "2026/27";
const SOURCE_URL = "https://fulltime.thefa.com/fixtures.html?selectedSeason=269137632&selectedFixtureGroupAgeGroup=14&selectedTeam=2142124";

type FixtureShape = {
  id: number;
  externalId: string | null;
  date: string | Date;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  status?: "scheduled" | "postponed" | "cancelled";
  pitchLocation?: string | null;
  pitchAddress?: string | null;
  sourceUrl: string;
};

const seed: FixtureShape[] = [
  ["30491469", "2026-09-12", "Neston Nomads U9 Vikings", "Victoria Colts U9 Dynamos"],
  ["30491473", "2026-09-19", "Ellesmere Port Town JFC U9 Rangers", "Neston Nomads U9 Vikings"],
  ["30491477", "2026-10-03", "Neston Nomads U9 Vikings", "West Kirby U9 Bayern"],
  ["30491484", "2026-10-10", "Upton U9 Upton FC", "Neston Nomads U9 Vikings"],
  ["30491488", "2026-10-17", "Neston Nomads U9 Vikings", "Neston Nomads U9 Knights"],
  ["30491493", "2026-10-24", "Wallasey Village YFC U9 Santos", "Neston Nomads U9 Vikings"],
  ["30491498", "2026-10-31", "Neston Nomads U9 Vikings", "Cammell Laird 1907 FC U9 Blue"],
  ["30491503", "2026-11-14", "Eastham Rangers FC U9 Colts", "Neston Nomads U9 Vikings"],
  ["30491509", "2026-11-21", "Neston Nomads U9 Vikings", "Moreton Football Club U9 Peru"],
  ["30491511", "2026-12-05", "Victoria Colts U9 Dynamos", "Neston Nomads U9 Vikings"],
  ["30491516", "2026-12-12", "Neston Nomads U9 Vikings", "Ellesmere Port Town JFC U9 Rangers"],
  ["30491523", "2026-12-19", "West Kirby U9 Bayern", "Neston Nomads U9 Vikings"],
].map(([externalId, date, homeTeam, awayTeam], index) => ({
  id: index + 1, externalId, date, kickoff: "09:00", homeTeam, awayTeam,
  competition: "Under 9 Division 5", sourceUrl: `https://fulltime.thefa.com/displayFixture.html?id=${externalId}`,
}));

function requireEditorKey(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.REPORT_EDITOR_KEY;
  if (!expected) { res.status(503).json({ error: "Report editor access is not configured." }); return; }
  if (req.header("x-report-editor-key") !== expected) { res.status(401).json({ error: "Invalid editor key." }); return; }
  next();
}

function decorate(fixture: FixtureShape) {
  const home = fixture.homeTeam === TEAM_NAME;
  return { ...fixture, status: fixture.status ?? "scheduled", pitchLocation: fixture.pitchLocation ?? null, pitchAddress: fixture.pitchAddress ?? null, opponent: home ? fixture.awayTeam : fixture.homeTeam, venue: home ? "Home" as const : "Away" as const };
}

function dateKey(value: string | Date) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateReplacement(data: {
  sourceName: string;
  sourceUrl: string;
  fixtures: Array<{
    externalId: string | null;
    date: string | Date;
    kickoff: string;
    homeTeam: string;
    awayTeam: string;
    competition: string;
    status?: "scheduled" | "postponed" | "cancelled";
    pitchLocation?: string | null;
    pitchAddress?: string | null;
    sourceUrl: string;
  }>;
}) {
  const sourceName = data.sourceName.trim();
  const sourceUrl = data.sourceUrl.trim();
  if (!sourceName) throw new Error("Source name is required.");
  if (!isHttpUrl(sourceUrl)) throw new Error("The official source link must be a complete http or https web address.");

  const fixtures = data.fixtures.map((fixture, index) => {
    const row = index + 1;
    const date = dateKey(fixture.date);
    const homeTeam = fixture.homeTeam.trim();
    const awayTeam = fixture.awayTeam.trim();
    const competition = fixture.competition.trim();
    const fixtureSourceUrl = fixture.sourceUrl.trim();
    const externalId = fixture.externalId?.trim() || null;
    const pitchLocation = fixture.pitchLocation?.trim() || null;
    const pitchAddress = fixture.pitchAddress?.trim() || null;

    if (!validDate(date)) throw new Error(`Row ${row}: enter a real fixture date.`);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(fixture.kickoff)) {
      throw new Error(`Row ${row}: kickoff must be a 24-hour time such as 09:00.`);
    }
    if (!homeTeam || !awayTeam) throw new Error(`Row ${row}: both home and away teams are required.`);
    if (homeTeam === awayTeam) throw new Error(`Row ${row}: home and away teams must be different.`);
    if (homeTeam !== TEAM_NAME && awayTeam !== TEAM_NAME) throw new Error(`Row ${row}: does not include ${TEAM_NAME}.`);
    if (!competition) throw new Error(`Row ${row}: competition is required.`);
    if (!isHttpUrl(fixtureSourceUrl)) throw new Error(`Row ${row}: source link must be a complete http or https web address.`);

    return { externalId, date, kickoff: fixture.kickoff, homeTeam, awayTeam, competition, status: fixture.status ?? "scheduled", pitchLocation, pitchAddress, sourceUrl: fixtureSourceUrl };
  });

  const unique = new Set(fixtures.map((fixture) => `${fixture.date}|${fixture.homeTeam}|${fixture.awayTeam}`));
  if (unique.size !== fixtures.length) throw new Error("Duplicate fixtures were found. Remove repeated date and team rows.");
  return { sourceName, sourceUrl, fixtures };
}

function parseDate(value: string) {
  const cleaned = value.trim();
  const iso = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return validDate(cleaned) ? cleaned : null;
  const match = cleaned.match(/^(?:[A-Za-z]{3,9}\s+)?(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (!match) return null;
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  const parsed = `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  return validDate(parsed) ? parsed : null;
}

function validDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return date.getUTCFullYear() === Number(match[1])
    && date.getUTCMonth() + 1 === Number(match[2])
    && date.getUTCDate() === Number(match[3]);
}

function splitImportColumns(line: string) {
  if (line.includes("\t")) return line.split("\t").map((value) => value.trim());
  if (line.includes("|")) return line.split("|").map((value) => value.trim());
  // CSV addresses often contain commas; respect quoted cells and escaped quotes.
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { cells.push(cell.trim()); cell = ""; }
    else cell += char;
  }
  if (quoted) throw new Error("An imported row has an unclosed quote. Close quoted CSV address cells or use tab-separated data.");
  cells.push(cell.trim());
  return cells;
}

function parseImport(text: string) {
  // Preserve trailing empty cells in tabular imports.
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const fixtures: Array<Omit<FixtureShape, "id"> & { date: string }> = [];
  const errors: string[] = [];
  let locationColumn = 6;
  let addressColumn = 7;
  let statusColumn = 8;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (/competition|division|league/i.test(line) && !/\t|,|\|/.test(line)) continue;
    const columns = splitImportColumns(line);
    if (/date/i.test(columns[0]) && /home/i.test(line)) {
      locationColumn = columns.findIndex((value) => /^(pitch\s*)?(location|name)$/i.test(value));
      addressColumn = columns.findIndex((value) => /^(pitch\s*)?address$/i.test(value));
      statusColumn = columns.findIndex((value) => /^status$/i.test(value));
      continue;
    }
    if (columns.length < 5) {
      errors.push(`Row ${index + 1}: expected Date, Time, Home team, Away team and Competition.`);
      continue;
    }
    const date = parseDate(columns[0]);
    if (!date) { errors.push(`Row ${index + 1}: enter a real date as DD/MM/YYYY or YYYY-MM-DD.`); continue; }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(columns[1])) {
      errors.push(`Row ${index + 1}: kickoff must be a 24-hour time such as 09:00.`);
      continue;
    }
    const homeTeam = columns[2];
    const awayTeam = columns[3];
    const rowCompetition = columns[4];
    if (!homeTeam || !awayTeam) { errors.push(`Row ${index + 1}: both home and away teams are required.`); continue; }
    if (!rowCompetition) { errors.push(`Row ${index + 1}: competition is required.`); continue; }
    if (homeTeam !== TEAM_NAME && awayTeam !== TEAM_NAME) { errors.push(`Row ${index + 1}: does not include ${TEAM_NAME}.`); continue; }
    const kickoff = columns[1];
    const rest = columns.slice(5).filter((_, offset) => offset + 5 !== locationColumn && offset + 5 !== addressColumn && offset + 5 !== statusColumn);
    const url = rest.find((value) => /^https?:\/\//.test(value)) ?? SOURCE_URL;
    const externalId = url.match(/[?&]id=(\d+)/)?.[1] ?? rest.find((value) => /^\d{5,}$/.test(value)) ?? null;
    const pitchLocation = columns[locationColumn]?.trim() || null;
    const pitchAddress = columns[addressColumn]?.trim() || null;
    const status = columns[statusColumn]?.trim().toLowerCase() || "scheduled";
    if (status !== "scheduled" && status !== "postponed" && status !== "cancelled") {
      errors.push(`Row ${index + 1}: status must be scheduled, postponed or cancelled.`);
      continue;
    }
    if ((pitchLocation?.length ?? 0) > 160 || (pitchAddress?.length ?? 0) > 500) {
      errors.push(`Row ${index + 1}: pitch location must be at most 160 characters and address at most 500.`);
      continue;
    }
    fixtures.push({ externalId, date, kickoff, homeTeam, awayTeam, competition: rowCompetition, status, pitchLocation, pitchAddress, sourceUrl: url });
  }
  if (errors.length) throw new Error(errors.slice(0, 8).join(" "));
  if (!fixtures.length) throw new Error("No fixtures were found. Paste rows as Date, Time, Home team, Away team, Competition and optional fixture URL.");
  const unique = new Set(fixtures.map((fixture) => `${fixture.date}|${fixture.homeTeam}|${fixture.awayTeam}`));
  if (unique.size !== fixtures.length) throw new Error("Duplicate fixtures were found. Remove repeated date and team rows.");
  return { fixtures, warnings: fixtures.some((fixture) => !fixture.externalId) ? ["Some rows have no fixture ID; their source link will open the main official schedule."] : [] };
}

router.get("/fixtures", async (req, res): Promise<void> => {
  if (req.query.season !== SEASON) { res.status(400).json({ error: "A valid season is required." }); return; }
  const [latest] = await db.select().from(fixtureImportsTable).where(eq(fixtureImportsTable.season, SEASON)).orderBy(desc(fixtureImportsTable.importedAt)).limit(1);
  if (!latest) {
    res.json(ListFixturesResponse.parse({
      fixtures: seed.map(decorate),
      importMeta: { sourceName: "FA Full-Time", sourceUrl: SOURCE_URL, importedAt: "2026-09-05T00:00:00.000Z" },
    }));
    return;
  }
  const rows = await db.select().from(fixturesTable).where(eq(fixturesTable.importId, latest.id)).orderBy(asc(fixturesTable.fixtureDate), asc(fixturesTable.id));
  res.json(ListFixturesResponse.parse({
    fixtures: rows.map((row) => decorate({ ...row, date: row.fixtureDate })),
    importMeta: { sourceName: latest.sourceName, sourceUrl: latest.sourceUrl, importedAt: latest.importedAt },
  }));
});

router.post("/fixture-imports/preview", requireEditorKey, (req, res): void => {
  const body = PreviewFixtureImportBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Paste a fixture list to continue." }); return; }
  try { res.json(PreviewFixtureImportResponse.parse(parseImport(body.data.text))); }
  catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "The fixture list could not be parsed." }); }
});

router.put("/fixtures", requireEditorKey, async (req, res): Promise<void> => {
  const body = ReplaceFixturesBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Review the fixture rows and correct any incomplete details." }); return; }
  let cleaned: ReturnType<typeof validateReplacement>;
  try {
    cleaned = validateReplacement(body.data);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Review the fixture rows and try again." });
    return;
  }
  const saved = await db.transaction(async (tx) => {
    const [record] = await tx.insert(fixtureImportsTable).values({ season: body.data.season, sourceName: cleaned.sourceName, sourceUrl: cleaned.sourceUrl }).returning();
    await tx.insert(fixturesTable).values(cleaned.fixtures.map((fixture) => ({
      importId: record.id, season: body.data.season, externalId: fixture.externalId, fixtureDate: fixture.date,
      kickoff: fixture.kickoff, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam,
      competition: fixture.competition, sourceUrl: fixture.sourceUrl,
      status: fixture.status,
      pitchLocation: fixture.pitchLocation, pitchAddress: fixture.pitchAddress,
    })));
    return record;
  });
  const fixtures = cleaned.fixtures.map((fixture, index) => decorate({ ...fixture, id: index + 1 }));
  res.json(ListFixturesResponse.parse({ fixtures, importMeta: { sourceName: saved.sourceName, sourceUrl: saved.sourceUrl, importedAt: saved.importedAt } }));
});

export default router;