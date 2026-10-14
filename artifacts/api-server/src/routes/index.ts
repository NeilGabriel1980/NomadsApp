import { Router, type IRouter } from "express";
import healthRouter from "./health";
import matchReportsRouter from "./match-reports";
import seasonMatchesRouter from "./season-matches";
import fixturesRouter from "./fixtures";

const router: IRouter = Router();

router.use(healthRouter);
router.use(matchReportsRouter);
router.use(seasonMatchesRouter);
router.use(fixturesRouter);

export default router;
