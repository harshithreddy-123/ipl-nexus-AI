import players from "../data/players.json";
import teams from "../data/teams.json";
import matches from "../data/matches.json";
import deliveries from "../data/deliveries.json";
import venues from "../data/venues.json";
import seasons from "../data/seasons.json";
import { cacheService } from "./cacheService";

const API_KEY = import.meta.env.VITE_CRICKET_API_KEY || "";
const API_HOST = import.meta.env.VITE_CRICKETDATA_API_HOST || "https://api.cricdata.example.com/v1";
const LIVE_CACHE_KEY = "live_matches_cache";
const CACHE_TTL = 1000 * 60 * 20;
const FALLBACK_CACHE_KEY = "last_data_fallback";

function buildUrl(endpoint, params = {}) {
  const url = new URL(`${API_HOST}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  if (API_KEY) {
    url.searchParams.set("apikey", API_KEY);
  }
  return url.toString();
}

async function fetchFromApi(endpoint, params = {}) {
  if (!API_KEY) {
    throw new Error("CricketData API key is not configured.");
  }
  const response = await fetch(buildUrl(endpoint, params));
  if (!response.ok) {
    throw new Error(`CricketData API request failed with ${response.status}`);
  }
  return response.json();
}

export function loadLocalFallback() {
  return {
    players,
    teams,
    matches,
    deliveries,
    venues,
    seasons,
  };
}

export function getCachedLiveMatches() {
  return cacheService.get(LIVE_CACHE_KEY) || null;
}

export function getCachedData(key) {
  return cacheService.get(key);
}

export function setCachedData(key, value, ttl = CACHE_TTL) {
  cacheService.set(key, value, ttl);
  return value;
}

export async function fetchCurrentMatches() {
  const payload = await fetchFromApi("currentMatches");
  return payload?.data || payload?.matches || [];
}

export async function fetchMatchInfo(matchId) {
  const payload = await fetchFromApi("matchInfo", { id: matchId });
  return payload?.data || null;
}

export async function fetchScorecard(matchId) {
  const payload = await fetchFromApi("scorecard", { match_id: matchId });
  return payload?.data || null;
}

export async function syncLiveData() {
  try {
    const matches = await fetchCurrentMatches();
    const saved = cacheService.set(LIVE_CACHE_KEY, matches, CACHE_TTL);
    if (!saved) {
      cacheService.set(FALLBACK_CACHE_KEY, { source: "local", timestamp: Date.now() }, CACHE_TTL);
    }
    return { source: "api", matches };
  } catch {
    const fallback = cacheService.get(LIVE_CACHE_KEY);
    if (fallback && fallback.length) {
      return { source: "cache", matches: fallback }; 
    }
    return { source: "local", matches: matches };
  }
}

export async function getLiveMatches() {
  const cache = cacheService.get(LIVE_CACHE_KEY);
  if (cache && cache.length) {
    return { source: "cache", matches: cache };
  }

  if (API_KEY) {
    try {
      return await syncLiveData();
    } catch {
      return { source: "local", matches };
    }
  }

  return { source: "local", matches };
}

export async function updateLiveCache() {
  return syncLiveData();
}
