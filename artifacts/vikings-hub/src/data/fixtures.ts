export type Fixture = {
  id: number;
  date: string; // YYYY-MM-DD
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  sourceUrl: string;
  opponent: string;
  venue: "Home" | "Away";
};

export const TEAM_NAME = "Neston Nomads U9 Vikings";
export const OFFICIAL_FIXTURES_URL = "https://fulltime.thefa.com/fixtures.html?selectedSeason=269137632&selectedFixtureGroupAgeGroup=14&selectedFixtureGroupKey=&selectedDateCode=all&selectedClub=&selectedTeam=2142124&selectedRelatedFixtureOption=3&selectedFixtureDateStatus=&selectedFixtureStatus=&previousSelectedFixtureGroupAgeGroup=14&previousSelectedFixtureGroupKey=&previousSelectedClub=&itemsPerPage=25";

const rawFixtures = [
  { id: 30491469, date: "2026-09-12", home: "Neston Nomads U9 Vikings", away: "Victoria Colts U9 Dynamos" },
  { id: 30491473, date: "2026-09-19", home: "Ellesmere Port Town JFC U9 Rangers", away: "Neston Nomads U9 Vikings" },
  { id: 30491477, date: "2026-10-03", home: "Neston Nomads U9 Vikings", away: "West Kirby U9 Bayern" },
  { id: 30491484, date: "2026-10-10", home: "Upton U9 Upton FC", away: "Neston Nomads U9 Vikings" },
  { id: 30491488, date: "2026-10-17", home: "Neston Nomads U9 Vikings", away: "Neston Nomads U9 Knights" },
  { id: 30491493, date: "2026-10-24", home: "Wallasey Village YFC U9 Santos", away: "Neston Nomads U9 Vikings" },
  { id: 30491498, date: "2026-10-31", home: "Neston Nomads U9 Vikings", away: "Cammell Laird 1907 FC U9 Blue" },
  { id: 30491503, date: "2026-11-14", home: "Eastham Rangers FC U9 Colts", away: "Neston Nomads U9 Vikings" },
  { id: 30491509, date: "2026-11-21", home: "Neston Nomads U9 Vikings", away: "Moreton Football Club U9 Peru" },
  { id: 30491511, date: "2026-12-05", home: "Victoria Colts U9 Dynamos", away: "Neston Nomads U9 Vikings" },
  { id: 30491516, date: "2026-12-12", home: "Neston Nomads U9 Vikings", away: "Ellesmere Port Town JFC U9 Rangers" },
  { id: 30491523, date: "2026-12-19", home: "West Kirby U9 Bayern", away: "Neston Nomads U9 Vikings" },
];

export const STATIC_FIXTURES: Fixture[] = rawFixtures.map(f => {
  const isHome = f.home === TEAM_NAME;
  return {
    id: f.id,
    date: f.date,
    kickoff: "09:00",
    homeTeam: f.home,
    awayTeam: f.away,
    competition: "Under 9 Division 5",
    sourceUrl: `https://fulltime.thefa.com/displayFixture.html?id=${f.id}`,
    opponent: isHome ? f.away : f.home,
    venue: isHome ? "Home" : "Away"
  };
});
