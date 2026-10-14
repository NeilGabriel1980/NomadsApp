import type { SeasonMatch } from "@workspace/api-client-react";
import type {
  Award,
  GoalLogEntry,
  Match,
  PlayerStats,
  SeasonData,
} from "./season";
import { season2026_27 } from "./season-2026-27";
import { normalizeCompetition } from "./competition";

const TEAM_NAME = "Neston Nomads Vikings";
const OWN_GOAL = "Own Goal (opp.)";

export function buildLiveSeasonData(liveMatches: SeasonMatch[]): SeasonData {
  let cumulativeGD = 0;
  const matches: Match[] = liveMatches.map((entry, index) => {
    const matchGD = entry.vikingsGF - entry.vikingsGA;
    cumulativeGD += matchGD;
    const isHome = entry.venue === "Home";

    return {
      id: entry.id,
      matchDate: entry.matchDate,
      num: index + 1,
      competition: normalizeCompetition(entry.competition),
      type: entry.type,
      homeTeam: isHome ? TEAM_NAME : entry.opponent,
      awayTeam: isHome ? entry.opponent : TEAM_NAME,
      homeScore: isHome ? entry.vikingsGF : entry.vikingsGA,
      awayScore: isHome ? entry.vikingsGA : entry.vikingsGF,
      result: entry.vikingsGF > entry.vikingsGA ? "W" : entry.vikingsGF < entry.vikingsGA ? "L" : "D",
      vikingsGF: entry.vikingsGF,
      vikingsGA: entry.vikingsGA,
      motm: entry.motm || "—",
      gotw: entry.gotw,
      captain: entry.captain,
      matchGD,
      cumulativeGD,
      opponent: entry.opponent,
      totalGoals: entry.vikingsGF + entry.vikingsGA,
      venue: entry.venue,
    };
  });

  const goalLog: GoalLogEntry[] = liveMatches.flatMap((match, index) =>
    match.goals.map((goal) => ({
      matchNum: index + 1,
      player: goal.player,
      goals: goal.goals,
    })),
  );

  const roster = season2026_27.roster;
  const playerStats: Record<string, PlayerStats> = Object.fromEntries(
    roster.map((player) => {
      const scoringEntries = goalLog.filter((entry) => entry.player === player);
      const goalsScored = scoringEntries.reduce((sum, entry) => sum + entry.goals, 0);
      return [
        player,
        {
          goalsScored,
          manOfTheMatch: matches.filter((match) => match.motm === player).length,
          goalOfTheWeek: matches.filter((match) => match.gotw === player).length,
          bestSingleMatchHaul: Math.max(0, ...scoringEntries.map((entry) => entry.goals)),
          matchesScoredIn: new Set(scoringEntries.map((entry) => entry.matchNum)).size,
        },
      ];
    }),
  );

  const topScorers = roster
    .map((player) => ({ player, goals: playerStats[player].goalsScored }))
    .sort((a, b) => b.goals - a.goals || a.player.localeCompare(b.player));

  const awardPlayers = [...roster];
  if (matches.some((match) => match.motm === "Team")) awardPlayers.push("Team");
  const awards: Award[] = awardPlayers
    .map((player) => ({
      player,
      motm: matches.filter((match) => match.motm === player).length,
      gotw: matches.filter((match) => match.gotw === player).length,
    }))
    .sort((a, b) => b.motm + b.gotw - (a.motm + a.gotw) || a.player.localeCompare(b.player));

  const wins = matches.filter((match) => match.result === "W").length;
  const draws = matches.filter((match) => match.result === "D").length;
  const losses = matches.filter((match) => match.result === "L").length;
  const goalsScored = matches.reduce((sum, match) => sum + match.vikingsGF, 0);
  const goalsConceded = matches.reduce((sum, match) => sum + match.vikingsGA, 0);
  const topGoalscorer = topScorers[0]?.goals > 0 ? topScorers[0] : null;
  const motmLeader = awards.filter((award) => award.player !== "Team").sort((a, b) => b.motm - a.motm)[0];

  const getPlayerGoalLog = (player: string) => goalLog.filter((entry) => entry.player === player);
  const getPlayerMatchHistory = (player: string) => {
    const goalsByMatch = new Map<number, number>();
    for (const entry of goalLog) {
      if (entry.player === player) {
        goalsByMatch.set(entry.matchNum, (goalsByMatch.get(entry.matchNum) ?? 0) + entry.goals);
      }
    }
    return matches.map((match) => ({
      ...match,
      playerGoals: goalsByMatch.get(match.num) ?? 0,
      playerHadAward: match.motm === player || match.gotw === player,
    }));
  };

  const finalEntry = liveMatches.findLast((match) => match.type.toLowerCase().includes("final"));
  const finalMatch = finalEntry ? matches.find((match) => match.id === finalEntry.id) : undefined;
  const cupFinal = finalEntry && finalMatch
    ? {
        headline: `${finalMatch.homeTeam} ${finalMatch.homeScore} – ${finalMatch.awayScore} ${finalMatch.awayTeam}`,
        scorers: finalEntry.goals
          .filter((goal) => goal.player !== OWN_GOAL)
          .flatMap((goal) => Array.from({ length: goal.goals }, () => goal.player)),
        motm: finalEntry.motm || "—",
        gotw: finalEntry.gotw || "—",
      }
    : null;

  return {
    ...season2026_27,
    summary: {
      matchesPlayed: matches.length,
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      goalDifference: goalsScored - goalsConceded,
      winPct: matches.length ? wins / matches.length : 0,
      topGoalscorer: topGoalscorer?.player ?? "—",
      topGoalscorerGoals: topGoalscorer?.goals ?? 0,
      mostMotms: motmLeader?.motm ? motmLeader.player : "—",
      mostMotmAwards: motmLeader?.motm ?? 0,
    },
    resultBreakdown: [
      { result: "Won", count: wins },
      { result: "Drawn", count: draws },
      { result: "Lost", count: losses },
    ],
    cupFinal,
    milestones: buildMilestones(matches, goalLog),
    topScorers,
    ownGoalsForVikings: goalLog
      .filter((entry) => entry.player === OWN_GOAL)
      .reduce((sum, entry) => sum + entry.goals, 0),
    teamTotalGoals: goalsScored,
    awards,
    roster,
    playerStats,
    matches,
    goalLog,
    getPlayerGoalLog,
    getPlayerMatchHistory,
  };
}

function buildMilestones(matches: Match[], goalLog: GoalLogEntry[]) {
  if (matches.length === 0) return [];
  const milestones: SeasonData["milestones"] = [];
  const biggestWin = [...matches].filter((match) => match.result === "W").sort((a, b) => b.matchGD - a.matchGD)[0];
  const highestScoring = [...matches].sort((a, b) => b.totalGoals - a.totalGoals)[0];
  const bestHaul = [...goalLog].filter((entry) => entry.player !== OWN_GOAL).sort((a, b) => b.goals - a.goals)[0];
  // Per-player totals do not establish scoring order. The season opener's
  // first scorer was confirmed by the team editor.
  const openingMatch = matches.find((match) => match.matchDate?.startsWith("2026-09-05"));
  const firstGoal = openingMatch
    ? goalLog.find((entry) => entry.matchNum === openingMatch.num && entry.player === "Olly")
    : undefined;
  const hatTricks = goalLog.filter((entry) => entry.player !== OWN_GOAL && entry.goals >= 3).length;

  if (biggestWin) {
    milestones.push({ icon: "🏆", title: "Biggest Win", detail: `Beat ${biggestWin.opponent} ${biggestWin.vikingsGF}-${biggestWin.vikingsGA}` });
  }
  milestones.push({
    icon: "⚽",
    title: "Highest-Scoring Match",
    detail: `${highestScoring.opponent} — ${highestScoring.homeScore}-${highestScoring.awayScore} (${highestScoring.totalGoals} goals)`,
  });
  if (bestHaul) {
    milestones.push({ icon: "🎯", title: "Best Individual Haul", detail: `${bestHaul.player} scored ${bestHaul.goals} vs ${matches[bestHaul.matchNum - 1]?.opponent}` });
  }
  milestones.push({ icon: "🎩", title: "Hat-tricks", detail: `${hatTricks} hat-trick${hatTricks === 1 ? "" : "s"} this season` });
  if (firstGoal) {
    milestones.push({ icon: "⭐", title: "First Goal of the Season", detail: `${firstGoal.player} vs ${matches[firstGoal.matchNum - 1]?.opponent}` });
  }

  const winStreak = longestRun(matches, (match) => match.result === "W");
  const unbeatenRun = longestRun(matches, (match) => match.result !== "L");
  milestones.push({ icon: "🔥", title: "Longest Winning Streak", detail: `${winStreak} match${winStreak === 1 ? "" : "es"} in a row` });
  milestones.push({ icon: "🛡️", title: "Longest Unbeaten Run", detail: `${unbeatenRun} match${unbeatenRun === 1 ? "" : "es"} unbeaten` });
  return milestones;
}

function longestRun(matches: Match[], predicate: (match: Match) => boolean) {
  let longest = 0;
  let current = 0;
  for (const match of matches) {
    current = predicate(match) ? current + 1 : 0;
    longest = Math.max(longest, current);
  }
  return longest;
}