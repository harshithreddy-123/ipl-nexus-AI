import * as cricketApi from "./cricketApi";
import * as analyticsService from "./analyticsService";
import { cacheService } from "./cacheService";

const PLAYER_API_LOOKUP_TTL = 1000 * 60 * 60 * 24;
const SEARCH_TTL = 1000 * 60 * 60 * 24;

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function buildSearchCacheKey(query, role) {
  return `player_search:${normalizeText(role)}:${normalizeText(query)}`;
}

function getLookupCacheKey(name) {
  return `player_lookup:${normalizeText(name)}`;
}

function dedupePlayers(players) {
  const seen = new Map();
  players.forEach((player) => {
    const key = normalizeText(player.apiId || player.id || player.name || "");
    if (!key) return;
    if (!seen.has(key)) {
      seen.set(key, {
        id: String(player.id || player.apiId || player.name || "").trim(),
        name: player.name || player.full_name || player.display_name || String(player.id || player.apiId || "").trim(),
        role: player.role || player.type || "player",
        team: player.team || player.currentTeam || player.teamName || "",
        country: player.country || player.nationality || "",
        battingStyle: player.battingStyle || player.batting_style || "",
        bowlingStyle: player.bowlingStyle || player.bowling_style || "",
        apiId: String(player.apiId || player.pid || player.id || "").trim(),
        source: player.source || "api",
      });
    }
  });
  return Array.from(seen.values());
}

export async function searchPlayers(query, role = "player") {
  const normalizedQuery = normalizeText(query);
  const cacheKey = buildSearchCacheKey(normalizedQuery, role);
  const localPlayers = analyticsService.findLocalPlayers(normalizedQuery, role);

  if (!normalizedQuery) {
    const preview = localPlayers.slice(0, 16);
    return { players: preview, source: preview.length ? "local" : "fallback" };
  }

  if (localPlayers.length > 0) {
    return { players: localPlayers.slice(0, 40), source: "local" };
  }

  const cached = cacheService.getCache(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return { players: cached.slice(0, 40), source: "cache" };
  }

  try {
    const apiResult = await cricketApi.searchPlayers(normalizedQuery, role, 40);
    const apiPlayers = (apiResult?.players || []).map((player) => ({
      ...player,
      apiId: player.apiId || player.id || player.name,
    }));
    const merged = dedupePlayers([...localPlayers, ...apiPlayers]);
    cacheService.setCache(cacheKey, merged, SEARCH_TTL);
    return {
      players: merged.slice(0, 40),
      source: apiResult?.error ? "fallback" : "api",
      error: apiResult?.error || null,
    };
  } catch (error) {
    return {
      players: localPlayers.slice(0, 40),
      source: localPlayers.length ? "local" : "fallback",
      error: error.message || "Player search failed.",
    };
  }
}

async function lookupApiProfile(playerIdOrName, role = "player") {
  const normalized = normalizeText(playerIdOrName);
  if (!normalized) return null;
  const lookupCache = cacheService.getCache(getLookupCacheKey(normalized));
  if (lookupCache) return lookupCache;

  if (Number.isNaN(Number(normalized))) {
    const searchResult = await cricketApi.searchPlayers(normalized, role, 1);
    const profile = searchResult.players?.[0] || null;
    if (profile) {
      cacheService.setCache(getLookupCacheKey(normalized), profile, PLAYER_API_LOOKUP_TTL);
    }
    return profile;
  }

  try {
    const profile = await cricketApi.getPlayerInfo(normalized);
    cacheService.setCache(getLookupCacheKey(normalized), profile, PLAYER_API_LOOKUP_TTL);
    return profile;
  } catch {
    return null;
  }
}

export async function getPlayerProfile(selected, venue = "", season = "") {
  const player = selected || {};
  const playerKey = player.apiId || player.id || player.name || "";
  const playerName = player.name || playerKey || "Unknown Player";

  const localProfile = analyticsService.getPlayerProfile(playerKey, venue, season);
  const hasBallByBallData = Boolean(localProfile?.hasBallByBallData);

  let apiProfile = null;
  if (!hasBallByBallData) {
    apiProfile = await lookupApiProfile(playerKey || playerName, "player");
  }

  const profile = {
    name: playerName,
    playerId: playerKey || playerName,
    team: player.team || apiProfile?.team || localProfile.team || "",
    role: player.role || apiProfile?.role || localProfile.role || "player",
    apiProfile,
    source: hasBallByBallData ? "local" : apiProfile ? "api" : "fallback",
    hasBallByBallData,
    message: hasBallByBallData
      ? "Ball-by-ball IPL analytics available."
      : "Requires ball-by-ball dataset for deeper historical player analytics.",
    ...localProfile,
  };

  if (!hasBallByBallData) {
    profile.overall = profile.overall || {
      runs: 0,
      ballsFaced: 0,
      strikeRate: 0,
      average: 0,
      dismissals: 0,
      fours: 0,
      sixes: 0,
      boundaryPct: 0,
      dotBallPct: 0,
    };
    profile.seasons = profile.seasons || [];
    profile.venueStats = profile.venueStats || [];
    profile.phasePerformance = profile.phasePerformance || {};
    profile.vsSpin = profile.vsSpin || { runs: 0, ballsFaced: 0, strikeRate: 0, average: 0 };
    profile.vsPace = profile.vsPace || { runs: 0, ballsFaced: 0, strikeRate: 0, average: 0 };
    profile.bowlerMatchups = profile.bowlerMatchups || [];
    profile.strengths = profile.strengths || [];
    profile.weaknesses = profile.weaknesses || [];
  }

  return profile;
}

export async function getBowlerProfile(selected, venue = "", season = "") {
  const player = selected || {};
  const playerKey = player.apiId || player.id || player.name || "";
  const playerName = player.name || playerKey || "Unknown Bowler";

  const localProfile = analyticsService.getBowlerProfile(playerKey, venue, season);
  const hasBallByBallData = Boolean(localProfile?.hasBallByBallData);

  let apiProfile = null;
  if (!hasBallByBallData) {
    apiProfile = await lookupApiProfile(playerKey || playerName, "bowler");
  }

  return {
    name: playerName,
    playerId: playerKey || playerName,
    team: player.team || apiProfile?.team || localProfile.team || "",
    role: player.role || apiProfile?.role || localProfile.role || "bowler",
    apiProfile,
    source: hasBallByBallData ? "local" : apiProfile ? "api" : "fallback",
    hasBallByBallData,
    message: hasBallByBallData
      ? "Ball-by-ball IPL analytics available."
      : "Requires ball-by-ball dataset for deeper historical bowler analytics.",
    ...localProfile,
  };
}

export async function getMatchup(batter, bowler, venue = "", season = "", phase = "") {
  const batterKey = batter?.apiId || batter?.id || batter?.name || "";
  const bowlerKey = bowler?.apiId || bowler?.id || bowler?.name || "";
  const matchup = analyticsService.getMatchup(batterKey, bowlerKey, venue, season, phase);

  if (matchup?.found) {
    return { ...matchup, source: "local" };
  }

  return {
    found: false,
    message: matchup?.message || "Detailed matchup requires ball-by-ball IPL deliveries dataset.",
    batter: batter?.name || batterKey || "Unknown batter",
    bowler: bowler?.name || bowlerKey || "Unknown bowler",
    venue,
    season,
    phase,
    requiresBallByBallData: true,
    source: matchup?.hasBallByBallData === false ? "fallback" : "local",
  };
}

export async function searchLocalPlayers(query, role = "player") {
  return analyticsService.findLocalPlayers(query, role);
}

export default {
  searchPlayers,
  getPlayerInfo: cricketApi.getPlayerInfo,
  getCurrentMatches: cricketApi.getCurrentMatches,
  getMatchInfo: cricketApi.getMatchInfo,
  getScorecard: cricketApi.getScorecard,
  getPlayerProfile,
  getBowlerProfile,
  getMatchup,
  searchLocalPlayers,
};
