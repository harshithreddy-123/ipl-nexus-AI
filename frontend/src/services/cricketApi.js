import fetcher from "./api/fetcher";
import { cacheService } from "./cacheService";
import localPlayers from "../data/players.json";
import matches from "../data/matches.json";
import deliveries from "../data/deliveries.json";
import teams from "../data/teams.json";
import venues from "../data/venues.json";
import { FALLBACK_PLAYERS } from "../data/fallbackPlayers";
import { liveMatchService } from "./liveMatchService";

const API_KEY = import.meta.env.VITE_CRICKET_API_KEY || "";
const API_HOST = import.meta.env.VITE_CRICKET_API_HOST || "https://api.cricapi.com/v1";
const SEARCH_TTL = 1000 * 60 * 60 * 24;
const PROFILE_TTL = 1000 * 60 * 60 * 24 * 7;
const LIVE_TTL = 1000 * 60;
const SCORECARD_TTL = 1000 * 60;

const mergeUniquePlayers = (players) => {
  const index = {};
  players.forEach((player) => {
    const key = String(player.id || player.name || "").trim().toLowerCase();
    if (!key) return;
    if (!index[key]) {
      index[key] = {
        id: String(player.id || player.name).trim(),
        name: player.name || player.full_name || player.display_name || String(player.id || player.name),
        role: player.role || "player",
        team: player.team || player.currentTeam || "",
        country: player.country || player.nationality || "",
        battingStyle: player.battingStyle || player.batting_style || "",
        bowlingStyle: player.bowlingStyle || player.bowling_style || "",
        apiId: player.apiId || player.pid || player.id || "",
        source: player.source || "local",
      };
    }
  });
  return Object.values(index);
};

const LOCAL_PLAYERS = mergeUniquePlayers([...localPlayers, ...FALLBACK_PLAYERS]);

function buildUrl(path, params = {}) {
  const url = new URL(`${API_HOST}/${path}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  if (API_KEY) {
    url.searchParams.set("apikey", API_KEY);
  }
  return url.toString();
}

function normalizeSearch(value) {
  return String(value || "").trim().toLowerCase();
}

function prepareQueryMatch(value) {
  return normalizeSearch(value).split(/\s+/).filter(Boolean);
}

function matchesPlayer(player, query) {
  const term = normalizeSearch(query);
  if (!term) return true;
  const normalizedName = normalizeSearch(player.name);
  const normalizedId = normalizeSearch(player.id);
  const normalizedTeam = normalizeSearch(player.team);
  const normalizedCountry = normalizeSearch(player.country);
  const normalizedRole = normalizeSearch(player.role);
  const tokens = prepareQueryMatch(query);

  const basicMatch =
    normalizedName.includes(term) ||
    normalizedId.includes(term) ||
    normalizedTeam.includes(term) ||
    normalizedCountry.includes(term) ||
    normalizedRole.includes(term);

  if (basicMatch) return true;

  return tokens.every((token) => normalizedName.includes(token) || normalizedTeam.includes(token) || normalizedCountry.includes(token));
}

function buildPlayerObject(player) {
  return {
    id: String(player.id || player.pid || player.name || "").trim(),
    name: player.name || player.full_name || player.display_name || String(player.id || player.pid || "").trim(),
    role: player.role || player.type || "player",
    team: player.team || player.currentTeam || player.teamName || "",
    country: player.country || player.nationality || "",
    battingStyle: player.battingStyle || player.batting_style || "",
    bowlingStyle: player.bowlingStyle || player.bowling_style || "",
    apiId: String(player.pid || player.id || player.apiId || "").trim(),
    source: player.source || "api",
  };
}

function normalizeStatus(value) {
  const status = String(value || "").toUpperCase();
  if (status.includes("LIVE") || status.includes("STARTED")) return "LIVE";
  if (status.includes("FINISHED") || status.includes("COMPLETED")) return "FINISHED";
  if (status.includes("SCHEDULED") || status.includes("NOT STARTED")) return "SCHEDULED";
  return status || "UNKNOWN";
}

function normalizeScore(score, teamName = "") {
  if (!score) {
    return {
      team: teamName,
      runs: 0,
      wickets: 0,
      overs: "",
      label: "Innings",
      runRate: "",
    };
  }

  const runs = Number(score.r || score.runs || 0);
  const wickets = Number(score.w || score.wickets || 0);
  const overs = String(score.o || score.overs || "");
  const balls = Number(String(overs).split(".")[0] || 0) * 6 + Number(String(overs).split(".")[1] || 0);
  const runRate = balls > 0 ? ((runs / balls) * 6).toFixed(2) : "";

  return {
    team: score.inning || score.team || teamName,
    runs,
    wickets,
    overs,
    label: score.inning || score.team || "Innings",
    runRate,
  };
}

function getTeamNames(match) {
  const teams = match?.teams || match?.teamInfo?.map((team) => team.name) || [];
  if (Array.isArray(teams) && teams.length >= 2) return teams;
  if (match?.name?.includes(" vs ")) return match.name.split(" vs ").slice(0, 2);
  return ["Team A", "Team B"];
}

function normalizeMatch(match = {}) {
  const teamNames = getTeamNames(match);
  const scoreDetails = Array.isArray(match.score)
    ? match.score.map((score, index) => normalizeScore(score, teamNames[index] || ""))
    : [];

  const scoreA = scoreDetails[0]
    ? `${scoreDetails[0].runs}/${scoreDetails[0].wickets}`
    : match.scoreA || "";
  const scoreB = scoreDetails[1]
    ? `${scoreDetails[1].runs}/${scoreDetails[1].wickets}`
    : match.scoreB || "";

  return {
    id: String(match.id || match.unique_id || match.matchId || match.name || "match"),
    name: match.name || `${teamNames[0]} vs ${teamNames[1]}`,
    teamNames,
    venue: match.venue || match.venueInfo?.name || "Venue TBA",
    status: normalizeStatus(match.matchStarted ? "LIVE" : match.status || match.matchType),
    phase: match.matchType || match.series || "T20",
    date: match.date || match.dateTimeGMT || "",
    dateTimeGMT: match.dateTimeGMT || "",
    toss: match.tossWinner ? `${match.tossWinner} won the toss${match.tossChoice ? ` and chose ${match.tossChoice}` : ""}` : match.toss || "",
    scoreA,
    scoreB,
    scoreDetails,
    runRate: scoreDetails[0]?.runRate || "",
    requiredRate: match.requiredRate || "",
    lastBall: match.lastBall || "",
    nextBowler: match.nextBowler || "",
    comment: match.status || match.description || "",
    previousBalls: match.previousBalls || [],
    raw: match,
  };
}

function mapMockLiveToMatch(mock) {
  const current = mock.currentInnings || {};
  const first = mock.innings?.[0] || {};
  return {
    id: mock.id,
    name: `${mock.teamBatting?.name || "Mumbai Indians"} vs ${mock.teamBowling?.name || "Chennai Super Kings"}`,
    teamNames: [mock.teamBatting?.name || "Mumbai Indians", mock.teamBowling?.name || "Chennai Super Kings"],
    venue: mock.venue,
    status: "LIVE",
    phase: mock.league || "IPL",
    toss: mock.toss,
    scoreA: `${current.score || 0}/${current.wickets || 0}`,
    scoreB: `${first.score || 0}/${first.wickets || 0}`,
    scoreDetails: [
      {
        team: current.team || mock.teamBatting?.shortName || "MI",
        runs: current.score || 0,
        wickets: current.wickets || 0,
        overs: current.overs || "",
        label: "Current innings",
        runRate: current.runRate || "",
      },
      {
        team: first.team || mock.teamBowling?.shortName || "CSK",
        runs: first.score || 0,
        wickets: first.wickets || 0,
        overs: first.overs || "",
        label: "First innings",
        runRate: first.runRate || "",
      },
    ],
    runRate: current.runRate || "",
    requiredRate: current.requiredRunRate || "",
    lastBall: current.recentBalls?.[current.recentBalls.length - 1] ?? "",
    previousBalls: current.recentBalls || [],
    partnership: current.partnership || null,
    batters: current.batsmen || [],
    bowlers: current.bowlers || [],
    commentary: mock.commentary || [],
    raw: mock,
  };
}

function dedupePlayers(players) {
  const seen = new Map();
  players.forEach((player) => {
    const key = normalizeSearch(player.id || player.name || "");
    if (!key) return;
    if (!seen.has(key)) {
      seen.set(key, buildPlayerObject(player));
    }
  });
  return Array.from(seen.values());
}

export async function searchPlayers(query, role = "player", limit = 30) {
  const normalizedQuery = normalizeSearch(query);
  const cacheKey = `player_search:${role}:${normalizedQuery}`;
  const localMatches = LOCAL_PLAYERS.filter((player) => {
    if (role !== "player" && normalizeSearch(player.role) !== normalizeSearch(role) && player.role !== "allrounder") {
      return false;
    }
    return matchesPlayer(player, normalizedQuery);
  });

  if (!normalizedQuery && localMatches.length > 0) {
    return { players: localMatches.slice(0, Math.min(limit, 12)), source: "local" };
  }

  if (normalizedQuery && localMatches.length > 0) {
    return { players: localMatches.slice(0, limit), source: "local" };
  }

  const cached = cacheService.getCache(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return { players: cached.slice(0, limit), source: "cache" };
  }

  if (!API_KEY) {
    return {
      players: localMatches.slice(0, limit),
      source: localMatches.length ? "local" : "fallback",
      error: normalizedQuery && !localMatches.length ? "API key is not configured." : null,
    };
  }

  try {
    const result = await fetcher(buildUrl("players", { search: normalizedQuery, offset: 0 }), {}, { retries: 1, timeout: 12000 });
    let payload = [];
    if (Array.isArray(result?.data)) {
      payload = result.data;
    } else if (Array.isArray(result?.players)) {
      payload = result.players;
    } else if (Array.isArray(result)) {
      payload = result;
    }

    const apiPlayers = payload.map(buildPlayerObject);
    const merged = dedupePlayers([...localMatches, ...apiPlayers]);
    cacheService.setCache(cacheKey, merged, SEARCH_TTL);
    return { players: merged.slice(0, limit), source: "api" };
  } catch (error) {
    return {
      players: localMatches.slice(0, limit),
      source: localMatches.length ? "local" : "fallback",
      error: error.message || "Player search failed.",
    };
  }
}

export async function getPlayerInfo(playerIdOrName) {
  const playerId = String(playerIdOrName || "").trim();
  const cacheKey = `player_profile:${playerId}`;
  const cached = cacheService.getCache(cacheKey);
  if (cached) return cached;
  if (!API_KEY) {
    throw new Error("CricketData API key is not configured.");
  }

  try {
    const result = await fetcher(buildUrl("players_info", { id: playerId }), {}, { retries: 1, timeout: 12000 });
    const payload = result?.data || result?.player || result;
    if (!payload) {
      throw new Error("Player info not found");
    }
    const player = buildPlayerObject(payload);
    cacheService.setCache(cacheKey, player, PROFILE_TTL);
    return player;
  } catch (error) {
    throw new Error(error.message || "Could not load player profile", { cause: error });
  }
}

export async function getSummary() {
  const cacheKey = "summary_overview";
  const cached = cacheService.getCache(cacheKey);
  if (cached) return cached;

  const totalMatches = Array.isArray(matches) ? matches.length : 0;
  const uniquePlayerIds = new Set();
  if (Array.isArray(localPlayers)) {
    localPlayers.forEach((player) => {
      const id = String(player.apiId || player.id || player.name || "").trim().toLowerCase();
      if (id) uniquePlayerIds.add(id);
    });
  }
  if (Array.isArray(FALLBACK_PLAYERS)) {
    FALLBACK_PLAYERS.forEach((player) => {
      const id = String(player.apiId || player.id || player.name || "").trim().toLowerCase();
      if (id) uniquePlayerIds.add(id);
    });
  }

  const totalRuns = Array.isArray(deliveries) ? deliveries.reduce((sum, record) => sum + Number(record.batsman_runs || 0), 0) : 0;
  const totalWickets = Array.isArray(deliveries) ? deliveries.filter((record) => record.player_dismissed).length : 0;

  const summary = {
    totalMatches,
    totalPlayers: uniquePlayerIds.size,
    totalTeams: Array.isArray(teams) ? teams.length : 0,
    totalVenues: Array.isArray(venues) ? venues.length : 0,
    totalRuns,
    totalWickets,
    seasons: Array.isArray(matches) ? Array.from(new Set(matches.map((item) => item.season))).length : 0,
    liveMatchStatus: API_KEY ? "CricketData API key enabled" : "CricketData API key missing",
  };

  cacheService.setCache(cacheKey, summary, 1000 * 60);
  return summary;
}

export async function getCurrentMatches() {
  const cacheKey = "current_matches";
  const cached = cacheService.getCache(cacheKey);
  if (cached) return cached;
  if (!API_KEY) {
    throw new Error("CricketData API key is not configured.");
  }
  const result = await fetcher(buildUrl("currentMatches", { offset: 0 }), {}, { retries: 1, timeout: 12000 });
  const payload = result?.data || result?.matches || result;
  cacheService.setCache(cacheKey, payload, LIVE_TTL);
  return payload;
}

export async function getLiveScores() {
  const cacheKey = "live_scores_normalized";
  const cached = cacheService.getCache(cacheKey);
  if (cached) return cached;

  try {
    const matchesPayload = await getCurrentMatches();
    const payload = Array.isArray(matchesPayload) ? matchesPayload : [];
    const normalized = payload.map(normalizeMatch);
    const result = {
      configured: Boolean(API_KEY),
      message: normalized.length
        ? "Live scores loaded from CricketData."
        : "No live matches are currently available.",
      matches: normalized,
      source: "api",
    };
    cacheService.setCache(cacheKey, result, LIVE_TTL);
    return result;
  } catch (error) {
    const mock = mapMockLiveToMatch(liveMatchService.getMockData());
    return {
      configured: Boolean(API_KEY),
      message: API_KEY
        ? "Live API is unavailable, showing resilient demo coverage."
        : "Add VITE_CRICKET_API_KEY for live provider data. Showing demo coverage.",
      matches: [mock],
      source: "fallback",
      error: error.message || "Live scores unavailable.",
    };
  }
}

export async function getLiveMatchDetail(matchId) {
  try {
    if (!matchId || String(matchId).startsWith("IPL2024")) {
      return {
        message: "Demo scorecard loaded from fallback coverage.",
        match: mapMockLiveToMatch(liveMatchService.getMockData()),
      };
    }
    const [info, scorecard] = await Promise.allSettled([getMatchInfo(matchId), getScorecard(matchId)]);
    const base = info.status === "fulfilled" ? info.value : {};
    const card = scorecard.status === "fulfilled" ? scorecard.value : {};
    const merged = normalizeMatch({ ...base, score: card?.score || base?.score });
    return {
      message: "Match detail loaded.",
      match: merged,
      raw: { info: base, scorecard: card },
    };
  } catch (error) {
    return {
      message: error.message || "Match detail unavailable, using fallback scorecard.",
      match: mapMockLiveToMatch(liveMatchService.getMockData()),
    };
  }
}

export async function syncLatestData() {
  cacheService.clearExpired?.();
  return { ok: true, syncedAt: new Date().toISOString() };
}

export async function getMatchInfo(matchId) {
  const cacheKey = `match_info:${matchId}`;
  const cached = cacheService.getCache(cacheKey);
  if (cached) return cached;
  if (!API_KEY) {
    throw new Error("CricketData API key is not configured.");
  }
  const result = await fetcher(buildUrl("match_info", { id: matchId }), {}, { retries: 1, timeout: 12000 });
  const payload = result?.data || result;
  cacheService.setCache(cacheKey, payload, LIVE_TTL);
  return payload;
}

export async function getScorecard(matchId) {
  const cacheKey = `match_scorecard:${matchId}`;
  const cached = cacheService.getCache(cacheKey);
  if (cached) return cached;
  if (!API_KEY) {
    throw new Error("CricketData API key is not configured.");
  }
  const result = await fetcher(buildUrl("match_scorecard", { id: matchId }), {}, { retries: 1, timeout: 12000 });
  const payload = result?.data || result;
  cacheService.setCache(cacheKey, payload, SCORECARD_TTL);
  return payload;
}

export async function getPlayers(role = "player") {
  return LOCAL_PLAYERS.filter((player) => {
    if (role === "player") return true;
    if (role === "allrounder") return player.role === "allrounder";
    return player.role === role || player.role === "allrounder";
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export default {
  getSummary,
  searchPlayers,
  getPlayerInfo,
  getCurrentMatches,
  getMatchInfo,
  getScorecard,
  getPlayers,
  getLiveScores,
  getLiveMatchDetail,
  syncLatestData,
};
