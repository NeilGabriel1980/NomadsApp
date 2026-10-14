import React from 'react';
import { useSeason } from '@/context/SeasonContext';
import { Trophy, Medal, Star, Target } from 'lucide-react';

export default function Records() {
  const { milestones, cupFinal, seasonLabel } = useSeason();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-display font-extrabold text-primary mb-4">Records & Milestones</h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
           The defining moments of Neston Nomads Vikings' {seasonLabel}.
        </p>
      </div>

      {cupFinal ? (
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 mb-16 shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full font-bold text-sm mb-6 uppercase tracking-widest shadow-sm">
              <Trophy size={16} /> Summer League Cup Final
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black mb-6 leading-tight">
              {cupFinal.headline.split(' – ')[0]} <br />
              <span className="text-secondary">–</span> <br />
              {cupFinal.headline.split(' – ')[1]}
            </h2>
          </div>
          
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 flex flex-col gap-4">
            <h3 className="font-display font-bold text-xl border-b border-white/20 pb-2 mb-2 text-center md:text-left">Final Honors</h3>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
                <Target size={20} />
              </div>
              <div>
                <div className="text-sm font-bold opacity-80 uppercase tracking-wider">Goalscorers</div>
                <div className="font-bold text-lg">{cupFinal.scorers.join(' & ')}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-secondary/30 rounded-full flex items-center justify-center text-secondary">
                <Medal size={20} />
              </div>
              <div>
                <div className="text-sm font-bold opacity-80 uppercase tracking-wider">Man of the Match</div>
                <div className="font-bold text-lg">{cupFinal.motm}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent/30 rounded-full flex items-center justify-center text-accent">
                <Star size={20} />
              </div>
              <div>
                <div className="text-sm font-bold opacity-80 uppercase tracking-wider">Grafter of the Week</div>
                <div className="font-bold text-lg">{cupFinal.gotw}</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      ) : (
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 mb-16 shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <Trophy className="mx-auto mb-5 text-secondary" size={52} />
            <h2 className="text-4xl md:text-5xl font-display font-black mb-4">The trophy cabinet awaits</h2>
            <p className="text-lg text-primary-foreground/85 font-medium">
              Season records and cup honours will be added here as the 2026/27 campaign unfolds.
            </p>
          </div>
        </div>
      )}

      {/* Milestones Grid */}
      <h3 className="text-3xl font-display font-bold text-center mb-8">Season Milestones</h3>
      {milestones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((milestone, idx) => (
            <div 
              key={idx} 
              className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 animate-in zoom-in-95 fill-mode-both"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-3xl mb-4 border border-border">
                {milestone.icon}
              </div>
              <h4 className="text-xl font-display font-bold text-foreground mb-2 leading-tight">
                {milestone.title}
              </h4>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {milestone.detail}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center">
          <p className="text-xl font-display font-bold text-muted-foreground">No milestones yet</p>
          <p className="text-muted-foreground mt-2">This space will fill up with memorable moments.</p>
        </div>
      )}
    </div>
  );
}
