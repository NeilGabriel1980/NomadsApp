import React, { useMemo } from 'react';
import { useSeason } from '@/context/SeasonContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Star, Medal } from 'lucide-react';

export default function Leaderboards() {
  const { topScorers, awards } = useSeason();
  const sortedAwards = useMemo(() => {
    return [...awards].sort((a, b) => (b.motm + b.gotw) - (a.motm + a.gotw));
  }, [awards]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-5xl font-display font-extrabold text-primary mb-3">Leaderboards</h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl">
          The stats that define the season. Goals, grit, and the glory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Top Scorers Section */}
        <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm flex flex-col animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-secondary text-secondary-foreground rounded-xl">
              <Trophy size={28} />
            </div>
            <h2 className="text-3xl font-display font-bold">Golden Boot Race</h2>
          </div>
          
          {topScorers.some((scorer) => scorer.goals > 0) ? (
            <>
              <div className="h-80 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topScorers} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="player" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 14, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} width={80} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: 'black' }}
                      itemStyle={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}
                    />
                    <Bar dataKey="goals" name="Goals" radius={[0, 8, 8, 0]} barSize={24}>
                      {topScorers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--secondary))' : 'hsl(var(--primary))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-auto">
                {topScorers.slice(0, 3).map((scorer, i) => (
                  <div key={scorer.player} className="bg-muted p-4 rounded-2xl text-center border border-border">
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}
                    </div>
                    <div className="text-xl font-display font-black text-foreground mb-1">{scorer.player}</div>
                    <div className="text-lg font-bold text-primary">{scorer.goals} <span className="text-sm">G</span></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-[360px] flex-1 flex-col items-center justify-center text-center px-6">
              <Trophy className="text-secondary mb-4" size={48} />
              <h3 className="font-display text-2xl font-bold mb-2">The race is wide open</h3>
              <p className="text-muted-foreground font-medium max-w-sm">Goals will be added here after the first matches of the season.</p>
            </div>
          )}
        </div>

        {/* Awards Section */}
        <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm flex flex-col animate-in slide-in-from-bottom-4 delay-150">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary text-primary-foreground rounded-xl">
              <Star size={28} />
            </div>
            <h2 className="text-3xl font-display font-bold">Awards Cabinet</h2>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="grid grid-cols-12 gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider px-4 mb-2">
              <div className="col-span-6">Player</div>
              <div className="col-span-3 text-center" title="Man of the Match">MOTM</div>
              <div className="col-span-3 text-center" title="Grafter of the Week">Grafter</div>
            </div>
            
            {sortedAwards.map((award, idx) => (
              <div 
                key={award.player} 
                className={`grid grid-cols-12 gap-2 items-center p-4 rounded-2xl border-2 transition-colors ${
                  idx === 0 
                    ? 'bg-secondary text-secondary-foreground border-secondary/50 shadow-sm' 
                    : 'bg-background border-border hover:border-primary/30'
                }`}
              >
                <div className="col-span-6 font-display font-bold text-lg flex items-center gap-2">
                  <span className="w-6 text-center opacity-50 text-sm">{idx + 1}.</span>
                  {award.player}
                </div>
                <div className="col-span-3 text-center font-bold text-xl flex justify-center items-center gap-1">
                  {award.motm} <Medal size={16} className={idx === 0 ? 'text-primary/70' : 'text-secondary'} />
                </div>
                <div className="col-span-3 text-center font-bold text-xl flex justify-center items-center gap-1">
                  {award.gotw} <Star size={16} className={idx === 0 ? 'text-primary/70' : 'text-primary'} aria-label="Grafter of the Week awards" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
