import React from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { useSeason, type SeasonKey } from '@/context/SeasonContext';

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { seasonKey, setSeasonKey, seasonIsLoading, seasonHasError } = useSeason();

  const nav = [
    { href: "/", label: "Home" },
    { href: "/fixtures", label: "Fixtures" },
    { href: "/matches", label: "Matches" },
    { href: "/leaderboards", label: "Leaderboards" },
    { href: "/squad", label: "Squad" },
    { href: "/player-lookup", label: "Player Lookup" },
    { href: "/reports", label: "Reports" },
    { href: "/records", label: "Records" }
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative selection:bg-secondary selection:text-secondary-foreground">
      <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md border-b-4 border-secondary">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-primary font-display font-black text-xl shadow-inner">
                V
              </div>
              <span className="font-display font-bold text-xl uppercase tracking-wider hidden sm:inline-block">
                Vikings Hub
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    location === item.href 
                      ? "bg-secondary text-secondary-foreground shadow-sm" 
                      : "text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <label htmlFor="season-switcher" className="sr-only">Select season</label>
              <select
                id="season-switcher"
                value={seasonKey}
                onChange={(event) => setSeasonKey(event.target.value as SeasonKey)}
                className="h-10 rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-2 text-xs font-bold text-primary-foreground outline-none focus:ring-2 focus:ring-secondary sm:px-3 sm:text-sm"
              >
                <option value="2026/27" className="text-foreground">2026/27 Season</option>
                <option value="2025/26" className="text-foreground">2025/26 Season</option>
              </select>
              <button 
                className="md:hidden p-2 -mr-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-primary border-b border-primary-foreground/20 shadow-xl animate-in slide-in-from-top-2">
            <nav className="flex flex-col p-4 gap-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-md text-base font-bold ${
                    location === item.href 
                      ? "bg-secondary text-secondary-foreground" 
                      : "text-primary-foreground hover:bg-primary-foreground/10"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {seasonIsLoading && (
        <div className="border-b border-secondary/30 bg-secondary/15 px-4 py-2 text-center text-sm font-bold text-foreground">
          Loading the shared 2026/27 season results…
        </div>
      )}
      {seasonHasError && (
        <div role="alert" className="border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm font-bold text-destructive">
          The shared season results could not be loaded. The figures shown may be incomplete; refresh the page to try again.
        </div>
      )}
      
      <main className="flex-1 flex flex-col relative z-0">
        <div className="absolute inset-0 z-[-1] bg-grid-pattern opacity-50" />
        {children}
      </main>
      
      <footer className="bg-primary text-primary-foreground/80 py-8 border-t-4 border-secondary mt-12">
        <div className="container mx-auto px-4 text-center font-medium">
          <p className="font-display text-lg text-primary-foreground mb-2">Neston Nomads Vikings U8</p>
          <p className="text-sm">{seasonKey} Season Hub</p>
        </div>
      </footer>
    </div>
  );
}
