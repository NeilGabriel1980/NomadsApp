import React, { useState } from 'react';
import { useSeason } from '@/context/SeasonContext';
import type { Match } from '@/data/season';
import { Search, Trophy, Star, ChevronDown, Check } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

export default function PlayerLookup() {
  const { roster, getPlayerMatchHistory } = useSeason();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const matchHistory = selectedPlayer ? getPlayerMatchHistory(selectedPlayer) : [];
  
  // Only show matches where they had an impact (scored or got an award)
  const impactMatches = matchHistory.filter(m => m.playerGoals > 0 || m.playerHadAward);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-display font-extrabold text-primary mb-4">Player Lookup</h1>
        <p className="text-xl text-muted-foreground font-medium mb-8 max-w-2xl mx-auto">
           Select a player to see their moments across the season.
        </p>

        {/* Custom Player Select */}
        <Popover.Root>
          <Popover.Trigger className="inline-flex items-center justify-between w-[280px] bg-card text-foreground border-2 border-primary/20 hover:border-primary px-6 py-4 rounded-full font-bold text-lg shadow-sm transition-all focus:outline-none focus:ring-4 ring-primary/20">
            {selectedPlayer ? selectedPlayer : "Choose a player..."}
            <ChevronDown className="opacity-50" />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="w-[280px] bg-card border-2 border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 z-50">
              <div className="max-h-[300px] overflow-y-auto">
                {roster.map(player => (
                  <button
                    key={player}
                    onClick={() => setSelectedPlayer(player)}
                    className="w-full text-left px-6 py-3 font-bold hover:bg-primary/10 flex items-center justify-between"
                  >
                    {player}
                    {selectedPlayer === player && <Check size={18} className="text-primary" />}
                  </button>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {!selectedPlayer && (
        <div className="bg-muted border-2 border-dashed border-border rounded-3xl p-12 text-center animate-in zoom-in-95">
          <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Search className="text-muted-foreground w-8 h-8" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">No player selected</h3>
          <p className="text-muted-foreground">Pick a name from the list above to view their highlight reel.</p>
        </div>
      )}

      {selectedPlayer && (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center font-display font-black text-3xl shadow-sm">
              {selectedPlayer.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground">{selectedPlayer}'s Impact</h2>
              <p className="text-muted-foreground font-medium">{impactMatches.length} memorable matches</p>
            </div>
          </div>

          {impactMatches.length > 0 ? (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {impactMatches.map((match, idx) => (
                <ImpactCard key={match.num} match={match} player={selectedPlayer} isLeft={idx % 2 === 0} />
              ))}
            </div>
          ) : (
             <div className="text-center p-10 bg-card rounded-2xl border border-border">
                <p className="font-bold text-muted-foreground">No specific match impact data found.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

function ImpactCard({ match, player, isLeft }: { match: Match & { playerGoals: number, playerHadAward: boolean }, player: string, isLeft: boolean }) {
  return (
    <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
      {/* Timeline marker */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-secondary text-secondary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold text-sm">
        M{match.num}
      </div>

      {/* Card */}
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-6 rounded-2xl border-2 border-border shadow-sm group-hover:border-primary/40 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded-md">
              {match.competition}
            </span>
            <div className="mt-2 text-lg font-display font-bold text-foreground leading-tight">
              vs {match.opponent}
            </div>
            <div className="text-sm font-medium text-muted-foreground mt-1">
              Result: {match.homeScore} - {match.awayScore} ({match.result})
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {match.playerGoals > 0 && (
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 12l3-7.5"/><path d="M12 12l-7.5 3"/><path d="M12 12l4.5 6"/><path d="M12 12l-6-4.5"/><path d="M12 12l6-4.5"/></svg> {match.playerGoals} Goal{match.playerGoals > 1 ? 's' : ''}
            </div>
          )}
          {match.motm === player && (
            <div className="flex items-center gap-1.5 bg-secondary/20 text-secondary-foreground px-3 py-1.5 rounded-lg font-bold text-sm border border-secondary/30">
              <Trophy size={16} className="text-secondary" /> MOTM
            </div>
          )}
          {match.gotw === player && (
            <div className="flex items-center gap-1.5 bg-accent/20 text-accent-foreground px-3 py-1.5 rounded-lg font-bold text-sm border border-accent/30">
              <Star size={16} className="text-accent" /> Grafter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
