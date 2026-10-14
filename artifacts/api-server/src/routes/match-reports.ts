import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db, matchReportsTable } from "@workspace/db";
import {
  CreateMatchReportBody,
  CreateMatchReportResponse,
  ListMatchReportsResponse,
  UpdateMatchReportBody,
  UpdateMatchReportResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const validSeasons = new Set(["2025/26", "2026/27"]);
const editorKeyHeader = "x-report-editor-key";

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

router.get("/match-reports", async (req, res) => {
  const season = typeof req.query.season === "string" ? req.query.season : "";
  if (!validSeasons.has(season)) {
    res.status(400).json({ error: "A valid season is required." });
    return;
  }

  const reports = await db
    .select()
    .from(matchReportsTable)
    .where(eq(matchReportsTable.season, season))
    .orderBy(desc(matchReportsTable.matchDate), desc(matchReportsTable.createdAt));

  res.json(
    ListMatchReportsResponse.parse({
      reports: reports.map((report) => ({
        ...report,
        createdAt: report.createdAt.toISOString(),
      })),
    }),
  );
});

router.post("/match-reports", requireEditorKey, async (req, res) => {
  const parsed = CreateMatchReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the report details and try again." });
    return;
  }

  const [report] = await db
    .insert(matchReportsTable)
    .values({
      season: parsed.data.season,
      matchDate: parsed.data.matchDate.toISOString().slice(0, 10),
      opponent: parsed.data.opponent.trim(),
      score: parsed.data.score.trim(),
      title: parsed.data.title.trim(),
      body: parsed.data.body.trim(),
    })
    .returning();

  res.status(201).json(
    CreateMatchReportResponse.parse({
      ...report,
      createdAt: report.createdAt.toISOString(),
    }),
  );
});

router.patch("/match-reports/:id", requireEditorKey, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(404).json({ error: "Report not found." });
    return;
  }

  const parsed = UpdateMatchReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the report details and try again." });
    return;
  }

  const [report] = await db
    .update(matchReportsTable)
    .set({
      season: parsed.data.season,
      matchDate: parsed.data.matchDate.toISOString().slice(0, 10),
      opponent: parsed.data.opponent.trim(),
      score: parsed.data.score.trim(),
      title: parsed.data.title.trim(),
      body: parsed.data.body.trim(),
    })
    .where(eq(matchReportsTable.id, id))
    .returning();

  if (!report) {
    res.status(404).json({ error: "Report not found." });
    return;
  }

  res.json(
    UpdateMatchReportResponse.parse({
      ...report,
      createdAt: report.createdAt.toISOString(),
    }),
  );
});

router.delete("/match-reports/:id", requireEditorKey, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(404).json({ error: "Report not found." });
    return;
  }

  const deleted = await db
    .delete(matchReportsTable)
    .where(eq(matchReportsTable.id, id))
    .returning({ id: matchReportsTable.id });

  if (deleted.length === 0) {
    res.status(404).json({ error: "Report not found." });
    return;
  }

  res.status(204).send();
});

export default router;