import React, { useMemo, useState } from 'react';
import { useSeason } from '@/context/SeasonContext';
import type { Match, GoalLogEntry } from '@/data/season';

export default function Matches() {
  const { matches, goalLog } = useSeason();
  const [filter, setFilter] = useState<string>("All");

  const competitions = useMemo(() => {
    const comps = new Set(matches.map(m => m.competition));
    return ["All", ...Array.from(comps)];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    if (filter === "All") return matches;
    return matches.filter(m => m.competition === filter);
  }, [filter, matches]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-5xl font-display font-extrabold text-primary mb-3">Match History</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl">
            Every goal and every result, all in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {competitions.map(comp => (
            <button
              key={comp}
              onClick={() => setFilter(comp)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 border-2 ${
                filter === comp
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card text-foreground border-border hover:border-primary/50"
              }`}
            >
              {comp}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredMatches.map((match, idx) => (
          <MatchCard
            key={match.num}
            match={match}
            scorers={goalLog.filter((entry) => entry.matchNum === match.num)}
            delay={Math.min(idx * 50, 800)}
          />
        ))}
      </div>
      
      {filteredMatches.length === 0 && (
        <div className="text-center py-20 bg-card rounded-2xl border-2 border-dashed border-border">
          <p className="text-xl font-bold text-muted-foreground">
            {matches.length === 0 ? "No results have been added yet." : "No matches found for this filter."}
          </p>
          {matches.length === 0 && (
            <p className="text-muted-foreground mt-2">The fixture list will come to life as the season progresses.</p>
          )}
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, scorers, delay }: { match: Match; scorers: GoalLogEntry[]; delay: number }) {
  const isWin = match.result === 'W';
  const isLoss = match.result === 'L';
  const isDraw = match.result === 'D';

  return (
    <div 
      className="group bg-card border-2 border-border hover:border-primary/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-bottom-4 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* Result Indicator Side */}
        <div className={`md:w-3 w-full h-2 md:h-auto ${
          isWin ? 'bg-primary' : isDraw ? 'bg-secondary' : 'bg-destructive'
        }`} />
        
        <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row items-center gap-6">
          
          {/* Meta Info */}
          <div className="w-full md:w-48 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start text-sm">
            <span className="font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Match {match.num}
            </span>
            <span className="font-semibold bg-muted px-3 py-1 rounded-md text-foreground">
              {match.competition}
            </span>
          </div>

          {/* Scoreline */}
          <div className="flex-1 flex items-center justify-center gap-4 md:gap-8 w-full">
            <div className={`flex-1 text-right font-display text-lg md:text-2xl font-bold ${match.homeTeam.includes('Vikings') ? 'text-primary' : 'text-foreground'}`}>
              {match.homeTeam}
            </div>
            
            <div className="bg-muted text-foreground font-display font-black text-2xl md:text-3xl px-6 py-3 rounded-xl border-2 border-border whitespace-nowrap min-w-[100px] text-center shadow-inner">
              {match.homeScore} - {match.awayScore}
            </div>
            
            <div className={`flex-1 text-left font-display text-lg md:text-2xl font-bold ${match.awayTeam.includes('Vikings') ? 'text-primary' : 'text-foreground'}`}>
              {match.awayTeam}
            </div>
          </div>

          {/* Awards */}
          <div className="w-full md:w-56 flex flex-row md:flex-col gap-2 justify-center md:justify-center bg-muted/50 p-4 rounded-xl border border-border">
            {match.captain && (
              <div className="flex items-center gap-2">
                <span className="text-foreground font-black" title="Captain">C</span>
                <span className="font-bold text-sm">Captain: <span className="text-foreground">{match.captain}</span></span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-secondary" title="Man of the Match">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </span>
              <span className="font-bold text-sm">MOTM: <span className="text-foreground">{match.motm}</span></span>
            </div>
            {match.gotw && (
              <div className="flex items-center gap-2">
                <span className="text-primary" title="Grafter of the Week">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                </span>
                <span className="font-bold text-sm">Grafter: <span className="text-foreground">{match.gotw}</span></span>
              </div>
            )}
          </div>

        </div>
      </div>
      <div className="border-t border-border bg-muted/30 px-5 py-4 md:px-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Vikings scorers</h3>
        {scorers.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label={`Scorers for match ${match.num}`}>
            {scorers.map((entry) => (
              <li key={entry.player} className="rounded-lg border border-primary/15 bg-primary/5 px-3 py-1.5 text-sm font-bold">
                {entry.player === "Own Goal (opp.)" ? "Opposition own goal" : entry.player}
                <span className="ml-2 text-primary">{entry.goals} {entry.goals === 1 ? "goal" : "goals"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-medium text-muted-foreground">
            {match.vikingsGF === 0 ? "No Vikings goals." : "Scorer details have not been recorded."}
          </p>
        )}
      </div>
    </div>
  );
}
