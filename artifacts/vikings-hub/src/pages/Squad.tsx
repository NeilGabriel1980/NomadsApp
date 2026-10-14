import React from 'react';
import { useSeason } from '@/context/SeasonContext';
import type { PlayerStats } from '@/data/season';
import { Activity, Star, Trophy, Target, ShieldAlert } from 'lucide-react';

export default function Squad() {
  const { roster, playerStats } = useSeason();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-5xl font-display font-extrabold text-primary mb-3">The Squad</h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl">
          Meet the Vikings squad for this season.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {roster.map((player, idx) => (
          <PlayerCard key={player} player={player} stats={playerStats[player]} delay={idx * 50} />
        ))}
      </div>
    </div>
  );
}

function PlayerCard({ player, stats, delay }: { player: string, stats: PlayerStats, delay: number }) {
  
  return (
    <div 
      className="group bg-card border-2 border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 animate-in zoom-in-95 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="bg-primary pt-10 pb-6 px-6 text-center relative overflow-hidden">
        {/* Abstract shape background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none group-hover:bg-secondary/20 transition-colors duration-500" />
        
        <div className="w-24 h-24 mx-auto bg-card text-card-foreground border-4 border-secondary rounded-full flex items-center justify-center font-display font-black text-4xl shadow-md mb-4 group-hover:scale-110 transition-transform duration-300">
          {player.charAt(0)}
        </div>
        <h2 className="text-2xl font-display font-bold text-primary-foreground tracking-wide">{player}</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatBox icon={<Target className="text-primary" />} label="Goals" value={stats.goalsScored} />
          <StatBox icon={<Activity className="text-primary" />} label="Games Scored" value={stats.matchesScoredIn} />
        </div>
        
        <div className="space-y-3">
          <StatRow icon={<Trophy size={18} className="text-secondary" />} label="Best Haul" value={stats.bestSingleMatchHaul > 0 ? `${stats.bestSingleMatchHaul} goals` : '-'} />
          <StatRow icon={<Star size={18} className="text-secondary" />} label="MOTM Awards" value={stats.manOfTheMatch} />
          <StatRow icon={<Star size={18} className="text-primary" />} label="Grafter Awards" value={stats.goalOfTheWeek} />
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="bg-muted p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-border">
      <div className="mb-2 bg-background p-2 rounded-full shadow-sm">{icon}</div>
      <div className="text-2xl font-display font-black text-foreground leading-none mb-1">{value}</div>
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border/50">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-bold text-sm text-foreground">{label}</span>
      </div>
      <span className="font-black font-display text-primary">{value}</span>
    </div>
  );
}
