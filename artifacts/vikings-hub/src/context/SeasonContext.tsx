import React from "react";
import {
  getListSeasonMatchesQueryKey,
  useListSeasonMatches,
} from "@workspace/api-client-react";
import { season2025_26, type SeasonData } from "@/data/season";
import { season2026_27 } from "@/data/season-2026-27";
import { buildLiveSeasonData } from "@/data/live-season";

export type SeasonKey = "2025/26" | "2026/27";

const seasons: Record<SeasonKey, SeasonData> = {
  "2025/26": season2025_26,
  "2026/27": season2026_27,
};

const STORAGE_KEY = "vikings-hub-season";

interface SeasonContextValue {
  seasonKey: SeasonKey;
  season: SeasonData;
  setSeasonKey: (seasonKey: SeasonKey) => void;
  seasonIsLoading: boolean;
  seasonHasError: boolean;
}

const SeasonContext = React.createContext<SeasonContextValue | null>(null);

function getInitialSeason(): SeasonKey {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "2025/26" || saved === "2026/27") return saved;
  }
  return "2026/27";
}

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const [seasonKey, setSeasonKey] = React.useState<SeasonKey>(getInitialSeason);
  const liveQueryKey = getListSeasonMatchesQueryKey({ season: "2026/27" });
  const liveSeasonQuery = useListSeasonMatches(
    { season: "2026/27" },
    {
      query: {
        queryKey: liveQueryKey,
        staleTime: 30_000,
      },
    },
  );

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, seasonKey);
  }, [seasonKey]);

  const season = React.useMemo(() => {
    if (seasonKey === "2025/26") return seasons[seasonKey];
    return liveSeasonQuery.data
      ? buildLiveSeasonData(liveSeasonQuery.data.matches)
      : season2026_27;
  }, [liveSeasonQuery.data, seasonKey]);

  const value = React.useMemo(
    () => ({
      seasonKey,
      season,
      setSeasonKey,
      seasonIsLoading: seasonKey === "2026/27" && liveSeasonQuery.isLoading,
      seasonHasError: seasonKey === "2026/27" && liveSeasonQuery.isError,
    }),
    [liveSeasonQuery.isError, liveSeasonQuery.isLoading, season, seasonKey],
  );

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeason() {
  const context = React.useContext(SeasonContext);
  if (!context) {
    throw new Error("useSeason must be used inside SeasonProvider");
  }

  return {
    ...context.season,
    seasonKey: context.seasonKey,
    setSeasonKey: context.setSeasonKey,
    seasonIsLoading: context.seasonIsLoading,
    seasonHasError: context.seasonHasError,
  };
}