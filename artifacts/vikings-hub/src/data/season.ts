// 2025/26 season data for Neston Nomads Vikings, sourced from the club's season spreadsheet.
// All data is static (the season is complete) — no backend needed.

export interface Match {
  id?: number;
  matchDate?: string;
  num: number;
  competition: string;
  type: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  result: "W" | "D" | "L";
  vikingsGF: number;
  vikingsGA: number;
  motm: string;
  gotw: string | null;
  captain?: string | null;
  matchGD: number;
  cumulativeGD: number;
  opponent: string;
  totalGoals: number;
  venue: "Home" | "Away";
}

export interface GoalLogEntry {
  matchNum: number;
  player: string;
  goals: number;
}

export interface TopScorer {
  player: string;
  goals: number;
}

export interface Award {
  player: string;
  motm: number;
  gotw: number;
}

export interface PlayerStats {
  goalsScored: number;
  manOfTheMatch: number;
  goalOfTheWeek: number;
  bestSingleMatchHaul: number;
  matchesScoredIn: number;
}

export const TEAM_NAME = "Neston Nomads Vikings";
export const SEASON_LABEL = "2025/26 Season";
export const SEASON_TAGLINE =
  "Division 5 → Division 4 → Summer League Champions";
export const AGE_GROUP = "U8";

export const seasonSummary = {
  matchesPlayed: 35,
  wins: 22,
  draws: 5,
  losses: 8,
  goalsScored: 142,
  goalsConceded: 85,
  goalDifference: 57,
  winPct: 0.628571428571429,
  topGoalscorer: "Alex",
  topGoalscorerGoals: 32,
  mostMotms: "Olly",
  mostMotmAwards: 6,
};

export const resultBreakdown = [
  { result: "Won", count: 22 },
  { result: "Drawn", count: 5 },
  { result: "Lost", count: 8 },
];

export const cupFinal = {
  headline: "Neston Nomads Raiders 0 – 2 Neston Nomads Vikings",
  scorers: ["Olly", "Freddie"],
  motm: "Sam",
  gotw: "Alex",
};

export const milestones: { icon: string; title: string; detail: string }[] = [
  { icon: "🏆", title: "Biggest Win", detail: "Beat Heswall 7-0 (won by 7 goals)" },
  { icon: "😥", title: "Toughest Result", detail: "Lost to Victoria Colts 1-5" },
  { icon: "⚽", title: "Highest-Scoring Match", detail: "Moreton Peru — 6-6 (12 goals in total)" },
  { icon: "🔥", title: "Longest Winning Streak", detail: "5 matches in a row" },
  { icon: "🛡️", title: "Longest Unbeaten Run", detail: "9 matches unbeaten" },
  { icon: "🎯", title: "Best Individual Haul", detail: "Harry scored 5 in one match (vs West Kirby)" },
  { icon: "🎩", title: "Hat-tricks (3+ goals in a match)", detail: "4 hat-tricks this season" },
  { icon: "⭐", title: "First Goal of the Season", detail: "Noah vs Oldershaw Dynamos" },
  { icon: "🏆", title: "Cup Final Result", detail: "Beat Neston Nomads Raiders 2-0 (MOTM: Sam, Grafter of the Week: Alex)" },
];

export const topScorers: TopScorer[] = [
  { player: "Alex", goals: 32 },
  { player: "Freddie", goals: 28 },
  { player: "Harry", goals: 21 },
  { player: "Noah", goals: 20 },
  { player: "Olly", goals: 15 },
  { player: "Max", goals: 8 },
  { player: "Will", goals: 5 },
  { player: "Sam", goals: 4 },
  { player: "Fredrick", goals: 3 },
  { player: "Edward", goals: 2 },
];

export const ownGoalsForVikings = 4;
export const teamTotalGoals = 142;

export const awards: Award[] = [
  { player: "Olly", motm: 6, gotw: 1 },
  { player: "Noah", motm: 4, gotw: 3 },
  { player: "Max", motm: 4, gotw: 0 },
  { player: "Fredrick", motm: 4, gotw: 3 },
  { player: "Alex", motm: 3, gotw: 5 },
  { player: "Freddie", motm: 3, gotw: 2 },
  { player: "Will", motm: 3, gotw: 2 },
  { player: "Sam", motm: 3, gotw: 2 },
  { player: "Harry", motm: 2, gotw: 2 },
  { player: "Edward", motm: 2, gotw: 3 },
  { player: "Team", motm: 1, gotw: 0 },
];

export const roster = [
  "Alex",
  "Freddie",
  "Harry",
  "Noah",
  "Olly",
  "Max",
  "Will",
  "Sam",
  "Fredrick",
  "Edward",
] as const;

export type RosterPlayer = (typeof roster)[number];

export const playerStats: Record<RosterPlayer, PlayerStats> = {
  Alex: { goalsScored: 32, manOfTheMatch: 3, goalOfTheWeek: 5, bestSingleMatchHaul: 3, matchesScoredIn: 20 },
  Freddie: { goalsScored: 28, manOfTheMatch: 3, goalOfTheWeek: 2, bestSingleMatchHaul: 2, matchesScoredIn: 21 },
  Harry: { goalsScored: 21, manOfTheMatch: 2, goalOfTheWeek: 2, bestSingleMatchHaul: 5, matchesScoredIn: 14 },
  Noah: { goalsScored: 20, manOfTheMatch: 4, goalOfTheWeek: 3, bestSingleMatchHaul: 2, matchesScoredIn: 14 },
  Olly: { goalsScored: 15, manOfTheMatch: 6, goalOfTheWeek: 1, bestSingleMatchHaul: 2, matchesScoredIn: 14 },
  Max: { goalsScored: 8, manOfTheMatch: 4, goalOfTheWeek: 0, bestSingleMatchHaul: 2, matchesScoredIn: 7 },
  Will: { goalsScored: 5, manOfTheMatch: 3, goalOfTheWeek: 2, bestSingleMatchHaul: 2, matchesScoredIn: 4 },
  Sam: { goalsScored: 4, manOfTheMatch: 3, goalOfTheWeek: 2, bestSingleMatchHaul: 1, matchesScoredIn: 4 },
  Fredrick: { goalsScored: 3, manOfTheMatch: 4, goalOfTheWeek: 3, bestSingleMatchHaul: 1, matchesScoredIn: 3 },
  Edward: { goalsScored: 2, manOfTheMatch: 2, goalOfTheWeek: 3, bestSingleMatchHaul: 1, matchesScoredIn: 2 },
};

export const matches: Match[] = [
  { num: 1, competition: "Division 5", type: "Friendly", homeTeam: "Oldershaw Dynamos", awayTeam: "Neston Nomads Vikings", homeScore: 2, awayScore: 6, result: "W", vikingsGF: 6, vikingsGA: 2, motm: "Harry", gotw: null, matchGD: 4, cumulativeGD: 4, opponent: "Oldershaw Dynamos", totalGoals: 8, venue: "Away" },
  { num: 2, competition: "Division 5", type: "League", homeTeam: "Oldershaw Dynamos", awayTeam: "Neston Nomads Vikings", homeScore: 1, awayScore: 4, result: "W", vikingsGF: 4, vikingsGA: 1, motm: "Noah", gotw: null, matchGD: 3, cumulativeGD: 7, opponent: "Oldershaw Dynamos", totalGoals: 5, venue: "Away" },
  { num: 3, competition: "Division 5", type: "League", homeTeam: "Wallasey Village", awayTeam: "Neston Nomads Vikings", homeScore: 2, awayScore: 6, result: "W", vikingsGF: 6, vikingsGA: 2, motm: "Freddie", gotw: null, matchGD: 4, cumulativeGD: 11, opponent: "Wallasey Village", totalGoals: 8, venue: "Away" },
  { num: 4, competition: "Division 5", type: "League", homeTeam: "Oldershaw Dragoons", awayTeam: "Neston Nomads Vikings", homeScore: 0, awayScore: 6, result: "W", vikingsGF: 6, vikingsGA: 0, motm: "Team", gotw: null, matchGD: 6, cumulativeGD: 17, opponent: "Oldershaw Dragoons", totalGoals: 6, venue: "Away" },
  { num: 5, competition: "Division 5", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Groves FX", homeScore: 5, awayScore: 2, result: "W", vikingsGF: 5, vikingsGA: 2, motm: "Noah", gotw: null, matchGD: 3, cumulativeGD: 20, opponent: "Groves FX", totalGoals: 7, venue: "Home" },
  { num: 6, competition: "Division 4", type: "League", homeTeam: "Moreton Peru", awayTeam: "Neston Nomads Vikings", homeScore: 6, awayScore: 6, result: "D", vikingsGF: 6, vikingsGA: 6, motm: "Max", gotw: null, matchGD: 0, cumulativeGD: 20, opponent: "Moreton Peru", totalGoals: 12, venue: "Away" },
  { num: 7, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "West Kirby", homeScore: 5, awayScore: 4, result: "W", vikingsGF: 5, vikingsGA: 4, motm: "Freddie", gotw: null, matchGD: 1, cumulativeGD: 21, opponent: "West Kirby", totalGoals: 9, venue: "Home" },
  { num: 8, competition: "Division 4", type: "League", homeTeam: "Victoria Colts", awayTeam: "Neston Nomads Vikings", homeScore: 5, awayScore: 1, result: "L", vikingsGF: 1, vikingsGA: 5, motm: "Sam", gotw: null, matchGD: -4, cumulativeGD: 17, opponent: "Victoria Colts", totalGoals: 6, venue: "Away" },
  { num: 9, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Higher Bebington Celtics", homeScore: 3, awayScore: 2, result: "W", vikingsGF: 3, vikingsGA: 2, motm: "Olly", gotw: null, matchGD: 1, cumulativeGD: 18, opponent: "Higher Bebington Celtics", totalGoals: 5, venue: "Home" },
  { num: 10, competition: "Division 4", type: "League", homeTeam: "Ellesmere Port", awayTeam: "Neston Nomads Vikings", homeScore: 4, awayScore: 1, result: "L", vikingsGF: 1, vikingsGA: 4, motm: "Freddie", gotw: null, matchGD: -3, cumulativeGD: 15, opponent: "Ellesmere Port", totalGoals: 5, venue: "Away" },
  { num: 11, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "West Kirby", homeScore: 4, awayScore: 7, result: "L", vikingsGF: 4, vikingsGA: 7, motm: "Alex", gotw: null, matchGD: -3, cumulativeGD: 12, opponent: "West Kirby", totalGoals: 11, venue: "Home" },
  { num: 12, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "West Kirby", homeScore: 4, awayScore: 1, result: "W", vikingsGF: 4, vikingsGA: 1, motm: "Will", gotw: null, matchGD: 3, cumulativeGD: 15, opponent: "West Kirby", totalGoals: 5, venue: "Home" },
  { num: 13, competition: "Division 4", type: "League", homeTeam: "Victoria Colts", awayTeam: "Neston Nomads Vikings", homeScore: 3, awayScore: 2, result: "L", vikingsGF: 2, vikingsGA: 3, motm: "Olly", gotw: "Alex", matchGD: -1, cumulativeGD: 14, opponent: "Victoria Colts", totalGoals: 5, venue: "Away" },
  { num: 14, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Higher Bebington Celtics", homeScore: 0, awayScore: 3, result: "L", vikingsGF: 0, vikingsGA: 3, motm: "Noah", gotw: "Freddie", matchGD: -3, cumulativeGD: 11, opponent: "Higher Bebington Celtics", totalGoals: 3, venue: "Home" },
  { num: 15, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Neston Nomads Raiders", homeScore: 3, awayScore: 3, result: "D", vikingsGF: 3, vikingsGA: 3, motm: "Will", gotw: "Harry", matchGD: 0, cumulativeGD: 11, opponent: "Neston Nomads Raiders", totalGoals: 6, venue: "Home" },
  { num: 16, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Ellesmere Port", homeScore: 7, awayScore: 3, result: "W", vikingsGF: 7, vikingsGA: 3, motm: "Sam", gotw: "Fredrick", matchGD: 4, cumulativeGD: 15, opponent: "Ellesmere Port", totalGoals: 10, venue: "Home" },
  { num: 17, competition: "Division 4", type: "League", homeTeam: "Heswall", awayTeam: "Neston Nomads Vikings", homeScore: 0, awayScore: 7, result: "W", vikingsGF: 7, vikingsGA: 0, motm: "Olly", gotw: "Edward", matchGD: 7, cumulativeGD: 22, opponent: "Heswall", totalGoals: 7, venue: "Away" },
  { num: 18, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Upton", homeScore: 5, awayScore: 3, result: "W", vikingsGF: 5, vikingsGA: 3, motm: "Fredrick", gotw: "Sam", matchGD: 2, cumulativeGD: 24, opponent: "Upton", totalGoals: 8, venue: "Home" },
  { num: 19, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Knights", awayTeam: "Neston Nomads Vikings", homeScore: 3, awayScore: 3, result: "D", vikingsGF: 3, vikingsGA: 3, motm: "Edward", gotw: "Olly", matchGD: 0, cumulativeGD: 24, opponent: "Neston Nomads Knights", totalGoals: 6, venue: "Away" },
  { num: 20, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Wallasey", homeScore: 4, awayScore: 3, result: "W", vikingsGF: 4, vikingsGA: 3, motm: "Alex", gotw: "Will", matchGD: 1, cumulativeGD: 25, opponent: "Wallasey", totalGoals: 7, venue: "Home" },
  { num: 21, competition: "Division 4", type: "League", homeTeam: "Cammell Lairds", awayTeam: "Neston Nomads Vikings", homeScore: 4, awayScore: 5, result: "W", vikingsGF: 5, vikingsGA: 4, motm: "Noah", gotw: "Will", matchGD: 1, cumulativeGD: 26, opponent: "Cammell Lairds", totalGoals: 9, venue: "Away" },
  { num: 22, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Moreton Peru", homeScore: 4, awayScore: 2, result: "W", vikingsGF: 4, vikingsGA: 2, motm: "Alex", gotw: "Fredrick", matchGD: 2, cumulativeGD: 28, opponent: "Moreton Peru", totalGoals: 6, venue: "Home" },
  { num: 23, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Victoria Colts", homeScore: 4, awayScore: 1, result: "W", vikingsGF: 4, vikingsGA: 1, motm: "Olly", gotw: "Noah", matchGD: 3, cumulativeGD: 31, opponent: "Victoria Colts", totalGoals: 5, venue: "Home" },
  { num: 24, competition: "Division 4", type: "League", homeTeam: "Bebington", awayTeam: "Neston Nomads Vikings", homeScore: 2, awayScore: 0, result: "L", vikingsGF: 0, vikingsGA: 2, motm: "Olly", gotw: "Fredrick", matchGD: -2, cumulativeGD: 29, opponent: "Bebington", totalGoals: 2, venue: "Away" },
  { num: 25, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Neston Nomads Raiders", homeScore: 7, awayScore: 1, result: "W", vikingsGF: 7, vikingsGA: 1, motm: "Will", gotw: "Edward", matchGD: 6, cumulativeGD: 35, opponent: "Neston Nomads Raiders", totalGoals: 8, venue: "Home" },
  { num: 26, competition: "Division 4", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Neston Nomads Raiders", homeScore: 5, awayScore: 1, result: "W", vikingsGF: 5, vikingsGA: 1, motm: "Fredrick", gotw: "Sam", matchGD: 4, cumulativeGD: 39, opponent: "Neston Nomads Raiders", totalGoals: 6, venue: "Home" },
  { num: 27, competition: "Summer League", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Heswall", homeScore: 4, awayScore: 1, result: "W", vikingsGF: 4, vikingsGA: 1, motm: "Max", gotw: "Alex", matchGD: 3, cumulativeGD: 42, opponent: "Heswall", totalGoals: 5, venue: "Home" },
  { num: 28, competition: "Summer League", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Wallasey Village", homeScore: 3, awayScore: 6, result: "L", vikingsGF: 3, vikingsGA: 6, motm: "Fredrick", gotw: "Noah", matchGD: -3, cumulativeGD: 39, opponent: "Wallasey Village", totalGoals: 9, venue: "Home" },
  { num: 29, competition: "Summer League", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Wallasey Pumas", homeScore: 2, awayScore: 2, result: "D", vikingsGF: 2, vikingsGA: 2, motm: "Edward", gotw: "Alex", matchGD: 0, cumulativeGD: 39, opponent: "Wallasey Pumas", totalGoals: 4, venue: "Home" },
  { num: 30, competition: "Summer League", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Neston Nomads Raiders", homeScore: 5, awayScore: 1, result: "W", vikingsGF: 5, vikingsGA: 1, motm: "Max", gotw: "Harry", matchGD: 4, cumulativeGD: 43, opponent: "Neston Nomads Raiders", totalGoals: 6, venue: "Home" },
  { num: 31, competition: "Summer League", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Saughall Colts", homeScore: 2, awayScore: 4, result: "L", vikingsGF: 2, vikingsGA: 4, motm: "Fredrick", gotw: "Edward", matchGD: -2, cumulativeGD: 41, opponent: "Saughall Colts", totalGoals: 6, venue: "Home" },
  { num: 32, competition: "Summer League", type: "League", homeTeam: "West Kirby", awayTeam: "Neston Nomads Vikings", homeScore: 0, awayScore: 7, result: "W", vikingsGF: 7, vikingsGA: 0, motm: "Max", gotw: "Noah", matchGD: 7, cumulativeGD: 48, opponent: "West Kirby", totalGoals: 7, venue: "Away" },
  { num: 33, competition: "Summer League", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "Wallasey Pumas", homeScore: 1, awayScore: 1, result: "D", vikingsGF: 1, vikingsGA: 1, motm: "Olly", gotw: "Alex", matchGD: 0, cumulativeGD: 48, opponent: "Wallasey Pumas", totalGoals: 2, venue: "Home" },
  { num: 34, competition: "Summer League", type: "League", homeTeam: "Neston Nomads Vikings", awayTeam: "West Kirby", homeScore: 9, awayScore: 2, result: "W", vikingsGF: 9, vikingsGA: 2, motm: "Harry", gotw: "Freddie", matchGD: 7, cumulativeGD: 55, opponent: "West Kirby", totalGoals: 11, venue: "Home" },
  { num: 35, competition: "Summer League", type: "Final 🏆", homeTeam: "Neston Nomads Raiders", awayTeam: "Neston Nomads Vikings", homeScore: 0, awayScore: 2, result: "W", vikingsGF: 2, vikingsGA: 0, motm: "Sam", gotw: "Alex", matchGD: 2, cumulativeGD: 57, opponent: "Neston Nomads Raiders", totalGoals: 2, venue: "Away" },
];

// Every scoring entry by match — includes "Own Goal (opp.)" entries (opposition
// own goals that counted for the Vikings), which are not part of the roster.
export const goalLog: GoalLogEntry[] = [
  { matchNum: 1, player: "Noah", goals: 1 }, { matchNum: 1, player: "Harry", goals: 2 }, { matchNum: 1, player: "Freddie", goals: 1 }, { matchNum: 1, player: "Alex", goals: 2 },
  { matchNum: 2, player: "Harry", goals: 2 }, { matchNum: 2, player: "Alex", goals: 2 },
  { matchNum: 3, player: "Freddie", goals: 1 }, { matchNum: 3, player: "Noah", goals: 2 }, { matchNum: 3, player: "Harry", goals: 1 }, { matchNum: 3, player: "Olly", goals: 1 }, { matchNum: 3, player: "Max", goals: 1 },
  { matchNum: 4, player: "Freddie", goals: 1 }, { matchNum: 4, player: "Alex", goals: 1 }, { matchNum: 4, player: "Noah", goals: 2 }, { matchNum: 4, player: "Fredrick", goals: 1 }, { matchNum: 4, player: "Olly", goals: 1 },
  { matchNum: 5, player: "Harry", goals: 1 }, { matchNum: 5, player: "Freddie", goals: 2 }, { matchNum: 5, player: "Alex", goals: 1 }, { matchNum: 5, player: "Noah", goals: 1 },
  { matchNum: 6, player: "Alex", goals: 3 }, { matchNum: 6, player: "Freddie", goals: 1 }, { matchNum: 6, player: "Fredrick", goals: 1 }, { matchNum: 6, player: "Max", goals: 1 },
  { matchNum: 7, player: "Freddie", goals: 2 }, { matchNum: 7, player: "Max", goals: 1 }, { matchNum: 7, player: "Harry", goals: 1 }, { matchNum: 7, player: "Alex", goals: 1 },
  { matchNum: 8, player: "Alex", goals: 1 },
  { matchNum: 9, player: "Alex", goals: 1 }, { matchNum: 9, player: "Harry", goals: 1 }, { matchNum: 9, player: "Freddie", goals: 1 },
  { matchNum: 10, player: "Freddie", goals: 1 },
  { matchNum: 11, player: "Harry", goals: 1 }, { matchNum: 11, player: "Alex", goals: 2 }, { matchNum: 11, player: "Noah", goals: 1 },
  { matchNum: 12, player: "Freddie", goals: 2 }, { matchNum: 12, player: "Own Goal (opp.)", goals: 1 }, { matchNum: 12, player: "Will", goals: 1 },
  { matchNum: 13, player: "Freddie", goals: 1 }, { matchNum: 13, player: "Will", goals: 1 },
  { matchNum: 15, player: "Noah", goals: 1 }, { matchNum: 15, player: "Freddie", goals: 1 }, { matchNum: 15, player: "Harry", goals: 1 },
  { matchNum: 16, player: "Harry", goals: 2 }, { matchNum: 16, player: "Freddie", goals: 2 }, { matchNum: 16, player: "Alex", goals: 2 }, { matchNum: 16, player: "Fredrick", goals: 1 },
  { matchNum: 17, player: "Alex", goals: 3 }, { matchNum: 17, player: "Sam", goals: 1 }, { matchNum: 17, player: "Max", goals: 2 }, { matchNum: 17, player: "Olly", goals: 1 },
  { matchNum: 18, player: "Alex", goals: 2 }, { matchNum: 18, player: "Max", goals: 1 }, { matchNum: 18, player: "Noah", goals: 2 },
  { matchNum: 19, player: "Alex", goals: 1 }, { matchNum: 19, player: "Edward", goals: 1 }, { matchNum: 19, player: "Noah", goals: 1 },
  { matchNum: 20, player: "Edward", goals: 1 }, { matchNum: 20, player: "Alex", goals: 3 },
  { matchNum: 21, player: "Olly", goals: 1 }, { matchNum: 21, player: "Harry", goals: 1 }, { matchNum: 21, player: "Freddie", goals: 2 }, { matchNum: 21, player: "Will", goals: 1 },
  { matchNum: 22, player: "Sam", goals: 1 }, { matchNum: 22, player: "Freddie", goals: 1 }, { matchNum: 22, player: "Alex", goals: 1 }, { matchNum: 22, player: "Own Goal (opp.)", goals: 1 },
  { matchNum: 23, player: "Alex", goals: 1 }, { matchNum: 23, player: "Olly", goals: 1 }, { matchNum: 23, player: "Noah", goals: 2 },
  { matchNum: 25, player: "Alex", goals: 1 }, { matchNum: 25, player: "Own Goal (opp.)", goals: 1 }, { matchNum: 25, player: "Olly", goals: 1 }, { matchNum: 25, player: "Freddie", goals: 2 }, { matchNum: 25, player: "Noah", goals: 2 },
  { matchNum: 26, player: "Olly", goals: 2 }, { matchNum: 26, player: "Noah", goals: 1 }, { matchNum: 26, player: "Alex", goals: 1 }, { matchNum: 26, player: "Freddie", goals: 1 },
  { matchNum: 27, player: "Olly", goals: 1 }, { matchNum: 27, player: "Harry", goals: 1 }, { matchNum: 27, player: "Freddie", goals: 1 }, { matchNum: 27, player: "Noah", goals: 1 },
  { matchNum: 28, player: "Olly", goals: 1 }, { matchNum: 28, player: "Noah", goals: 1 }, { matchNum: 28, player: "Freddie", goals: 1 },
  { matchNum: 29, player: "Olly", goals: 1 }, { matchNum: 29, player: "Freddie", goals: 1 },
  { matchNum: 30, player: "Max", goals: 1 }, { matchNum: 30, player: "Sam", goals: 1 }, { matchNum: 30, player: "Alex", goals: 1 }, { matchNum: 30, player: "Olly", goals: 1 }, { matchNum: 30, player: "Harry", goals: 1 },
  { matchNum: 31, player: "Sam", goals: 1 }, { matchNum: 31, player: "Harry", goals: 1 },
  { matchNum: 32, player: "Alex", goals: 2 }, { matchNum: 32, player: "Noah", goals: 2 }, { matchNum: 32, player: "Max", goals: 1 }, { matchNum: 32, player: "Will", goals: 2 },
  { matchNum: 33, player: "Olly", goals: 1 },
  { matchNum: 34, player: "Own Goal (opp.)", goals: 1 }, { matchNum: 34, player: "Harry", goals: 5 }, { matchNum: 34, player: "Olly", goals: 1 }, { matchNum: 34, player: "Freddie", goals: 2 },
  { matchNum: 35, player: "Olly", goals: 1 }, { matchNum: 35, player: "Freddie", goals: 1 },
];

/** Every match a given roster player scored in, with goals scored that match. */
export function getPlayerGoalLog(player: string) {
  return goalLog.filter((g) => g.player === player);
}

/** All matches, enriched with whether the given player scored and how many. */
export function getPlayerMatchHistory(player: string) {
  const goalsByMatch = new Map<number, number>();
  for (const g of goalLog) {
    if (g.player === player) {
      goalsByMatch.set(g.matchNum, (goalsByMatch.get(g.matchNum) ?? 0) + g.goals);
    }
  }
  return matches.map((m) => ({
    ...m,
    playerGoals: goalsByMatch.get(m.num) ?? 0,
    playerHadAward: m.motm === player || m.gotw === player,
  }));
}

export interface CupFinal {
  headline: string;
  scorers: string[];
  motm: string;
  gotw: string;
}

export interface SeasonData {
  seasonLabel: string;
  seasonTagline: string;
  summary: typeof seasonSummary;
  resultBreakdown: typeof resultBreakdown;
  cupFinal: CupFinal | null;
  milestones: typeof milestones;
  topScorers: TopScorer[];
  ownGoalsForVikings: number;
  teamTotalGoals: number;
  awards: Award[];
  roster: readonly string[];
  playerStats: Record<string, PlayerStats>;
  matches: Match[];
  goalLog: GoalLogEntry[];
  getPlayerGoalLog: (player: string) => GoalLogEntry[];
  getPlayerMatchHistory: (player: string) => Array<Match & { playerGoals: number; playerHadAward: boolean }>;
}

export const season2025_26: SeasonData = {
  seasonLabel: SEASON_LABEL,
  seasonTagline: SEASON_TAGLINE,
  summary: seasonSummary,
  resultBreakdown,
  cupFinal,
  milestones,
  topScorers,
  ownGoalsForVikings,
  teamTotalGoals,
  awards,
  roster,
  playerStats,
  matches,
  goalLog,
  getPlayerGoalLog,
  getPlayerMatchHistory,
};
