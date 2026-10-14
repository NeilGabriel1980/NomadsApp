import type { PlayerStats, SeasonData } from "./season";

const roster = [
  "Noah",
  "Harry",
  "Freddie",
  "Alex",
  "Edward",
  "Olly",
  "Max",
  "Fredrick",
  "Will",
  "Sam",
] as const;

const blankPlayerStats: PlayerStats = {
  goalsScored: 0,
  manOfTheMatch: 0,
  goalOfTheWeek: 0,
  bestSingleMatchHaul: 0,
  matchesScoredIn: 0,
};

const playerStats: Record<string, PlayerStats> = Object.fromEntries(
  roster.map((player) => [player, { ...blankPlayerStats }]),
);

const topScorers = roster.map((player) => ({ player, goals: 0 }));
const awards = roster.map((player) => ({ player, motm: 0, gotw: 0 }));

export const season2026_27: SeasonData = {
  seasonLabel: "2026/27 Season",
  seasonTagline: "A new season. A new chapter for the Vikings.",
  summary: {
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsScored: 0,
    goalsConceded: 0,
    goalDifference: 0,
    winPct: 0,
    topGoalscorer: "—",
    topGoalscorerGoals: 0,
    mostMotms: "—",
    mostMotmAwards: 0,
  },
  resultBreakdown: [
    { result: "Won", count: 0 },
    { result: "Drawn", count: 0 },
    { result: "Lost", count: 0 },
  ],
  cupFinal: null,
  milestones: [],
  topScorers,
  ownGoalsForVikings: 0,
  teamTotalGoals: 0,
  awards,
  roster,
  playerStats,
  matches: [],
  goalLog: [],
  getPlayerGoalLog: () => [],
  getPlayerMatchHistory: () => [],
};