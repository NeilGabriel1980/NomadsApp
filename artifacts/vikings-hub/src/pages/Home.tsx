import React from 'react';
import { useSeason } from '@/context/SeasonContext';
import { Trophy, Star, TrendingUp, Shield, Activity, Crown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { Link } from 'wouter';
import { NextMatch } from '@/components/NextMatch';

const COLORS = {
  Won: 'hsl(var(--primary))',
  Drawn: 'hsl(var(--secondary))',
  Lost: 'hsl(var(--destructive))',
};

export default function Home() {
  const {
    seasonLabel,
    seasonTagline,
    summary,
    resultBreakdown,
    matches,
    seasonKey,
  } = useSeason();

  const chartData = resultBreakdown.map(item => ({
    name: item.result,
    value: item.count,
    color: COLORS[item.result as keyof typeof COLORS]
  }));

  const gdData = matches.map(m => ({
    match: `M${m.num}`,
    gd: m.cumulativeGD
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 mb-12 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-[80px] opacity-10 -ml-10 -mb-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-block bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full font-bold text-sm mb-6 uppercase tracking-widest shadow-sm">
            {seasonLabel}
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6 leading-tight drop-shadow-md">
            Neston Nomads Vikings
          </h1>
          <p className="text-xl md:text-3xl font-medium text-primary-foreground/90 max-w-3xl leading-relaxed">
            {seasonTagline}
          </p>
        </div>
      </div>

      {seasonKey === "2026/27" && <NextMatch />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        <StatCard icon={<Activity />} label="Played" value={summary.matchesPlayed} delay={100} />
        <StatCard icon={<Trophy />} label="Wins" value={summary.wins} highlight delay={200} />
        <StatCard icon={<TrendingUp />} label="Win Rate" value={`${Math.round(summary.winPct * 100)}%`} delay={300} />
        <StatCard icon={<Crown />} label="Goals For" value={summary.goalsScored} highlight delay={400} />
        <StatCard icon={<Shield />} label="Goals Agst" value={summary.goalsConceded} delay={500} />
        <StatCard icon={<Star />} label="Goal Diff" value={`${summary.goalDifference >= 0 ? '+' : ''}${summary.goalDifference}`} highlight delay={600} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Results Breakdown */}
        <div className="bg-card text-card-foreground border-2 border-border rounded-2xl p-6 shadow-sm flex flex-col items-center lg:items-start animate-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-2xl font-display font-bold mb-6">Season Results</h2>
          {matches.length > 0 ? (
            <>
              <div className="w-full h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-6 justify-center w-full mt-4">
                {chartData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold">{item.name} <span className="text-muted-foreground ml-1">({item.value})</span></span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <FreshSeasonMessage title="No results yet" detail="Your match results will appear here as the new season gets underway." />
          )}
        </div>

        {/* Goal Difference Chart */}
        <div className="bg-card text-card-foreground border-2 border-border rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col animate-in slide-in-from-bottom-4 duration-700 delay-150">
          <h2 className="text-2xl font-display font-bold mb-2">The Unstoppable Climb</h2>
          <p className="text-muted-foreground mb-6 font-medium">Cumulative goal difference match-by-match</p>
          {matches.length > 0 ? (
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gdData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="match" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={30} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: 'black' }}
                    labelStyle={{ fontWeight: 'bold', color: 'black', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="gd" name="Goal Diff" stroke="hsl(var(--secondary))" strokeWidth={4} fillOpacity={1} fill="url(#colorGd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <FreshSeasonMessage title="The climb starts here" detail="Add the first result to begin tracking the Vikings' goal difference." />
          )}
        </div>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-300">
        <Link href="/matches" className="group">
          <div className="bg-card hover:bg-primary border-2 border-border hover:border-primary text-card-foreground hover:text-primary-foreground rounded-2xl p-8 shadow-sm transition-all duration-300 h-full flex items-center justify-between cursor-pointer">
            <div>
              <h3 className="text-2xl font-display font-bold mb-2">Match History</h3>
              <p className="opacity-80 font-medium">Relive every game of the season.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
              →
            </div>
          </div>
        </Link>
        <Link href="/squad" className="group">
          <div className="bg-card hover:bg-primary border-2 border-border hover:border-primary text-card-foreground hover:text-primary-foreground rounded-2xl p-8 shadow-sm transition-all duration-300 h-full flex items-center justify-between cursor-pointer">
            <div>
              <h3 className="text-2xl font-display font-bold mb-2">The Squad</h3>
              <p className="opacity-80 font-medium">Player cards and individual stats.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
              →
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function FreshSeasonMessage({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-1 min-h-[250px] flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-full bg-secondary/20 text-secondary-foreground flex items-center justify-center mb-4">
        <Activity className="text-secondary" size={28} />
      </div>
      <h3 className="font-display text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground font-medium max-w-sm">{detail}</p>
    </div>
  );
}

function StatCard({ icon, label, value, highlight = false, delay = 0 }: { icon: React.ReactNode, label: string, value: string | number, highlight?: boolean, delay?: number }) {
  return (
    <div 
      className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm border-2 ${
        highlight 
          ? 'bg-secondary text-secondary-foreground border-secondary/50' 
          : 'bg-card text-card-foreground border-border'
      } animate-in zoom-in-95 duration-500 fill-mode-both`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`mb-3 ${highlight ? 'opacity-80' : 'text-primary/70'}`}>
        {icon}
      </div>
      <div className="text-3xl font-display font-black mb-1">{value}</div>
      <div className={`text-xs font-bold uppercase tracking-wide ${highlight ? 'opacity-90' : 'text-muted-foreground'}`}>
        {label}
      </div>
    </div>
  );
}
