import players from "../data/players.json";
import { FALLBACK_PLAYERS as fallbackPlayers } from "../data/fallbackPlayers";
import deliveries from "../data/deliveries.json";
import { calculateMatchupMetrics, filterDeliveriesByMatchup } from "../utils/matchupUtils";
import {
  calculatePlayerOverall,
  calculateSeasonSeries,
  calculateVenueSeries,
  calculatePhaseSeries,
  calculateSpinPace,
  calculateBowlerBreakdown,
  buildPlayerSummary,
} from "../utils/playerStatsUtils";
import { filterByVenue } from "../utils/venueUtils";
import { filterBySeason, buildTrendSummary } from "../utils/seasonUtils";

const FULL_PLAYER_INDEX = [...players, ...fallbackPlayers].reduce((index, player) => {
  const key = String(player.id || player.name || "").trim().toLowerCase();
  if (!key) return index;
  if (!index[key]) {
    index[key] = {
      id: String(player.id || player.name).trim(),
      name: player.name || String(player.id || player.name),
      role: player.role || "player",
      team: player.team || "",
      country: player.country || "",
      battingStyle: player.battingStyle || "",
      bowlingStyle: player.bowlingStyle || "",
      apiId: player.apiId || player.id || "",
    };
  }
  return index;
}, {});

const LOCAL_PLAYERS = Object.values(FULL_PLAYER_INDEX).sort((a, b) => a.name.localeCompare(b.name));

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function matchQuery(value, query) {
  const text = normalizeText(value);
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;
  if (text.includes(normalizedQuery)) return true;
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  return queryTokens.every((token) => text.includes(token));
}

export function getLocalPlayers(role = "player") {
  return LOCAL_PLAYERS.filter((player) => {
    if (role === "player") return true;
    if (role === "allrounder") return player.role === "allrounder";
    return player.role === role || player.role === "allrounder";
  });
}

export function findLocalPlayers(query = "", role = "player", limit = 40) {
  const normalized = normalizeText(query);
  const matches = getLocalPlayers(role).filter((player) => {
    return (
      matchQuery(player.name, normalized) ||
      matchQuery(player.id, normalized) ||
      matchQuery(player.team, normalized) ||
      matchQuery(player.country, normalized)
    );
  });
  return matches.slice(0, limit);
}

export function resolvePlayer(playerId) {
  const normalizedId = normalizeText(playerId);
  return (
    LOCAL_PLAYERS.find(
      (player) =>
        normalizeText(player.id) === normalizedId ||
        normalizeText(player.name) === normalizedId ||
        normalizeText(player.apiId) === normalizedId
    ) ||
    {
      id: playerId,
      name: playerId,
      role: "player",
      team: "",
      country: "",
      battingStyle: "",
      bowlingStyle: "",
    }
  );
}

export function hasBallByBallData() {
  return Array.isArray(deliveries) && deliveries.length > 0;
}

function getPlayerDeliveries(player, roleColumn = "batter") {
  if (!hasBallByBallData()) return [];
  const normalizedName = normalizeText(player.name);
  const normalizedId = normalizeText(player.id);

  return deliveries.filter((delivery) => {
    const value = normalizeText(delivery[roleColumn] || delivery.batsman || "");
    return value === normalizedName || value === normalizedId;
  });
}

export function getMatchup(batter, bowler, venue = "", season = "", phase = "") {
  if (!hasBallByBallData()) {
    return {
      found: false,
      requiresBallByBallData: true,
      message: "Detailed matchup requires ball-by-ball IPL deliveries dataset.",
      batter,
      bowler,
      venue,
      season,
      phase,
    };
  }

  const parsedBatter = resolvePlayer(batter);
  const parsedBowler = resolvePlayer(bowler);
  const filteredDeliveries = filterDeliveriesByMatchup(
    deliveries,
    parsedBatter.name,
    parsedBowler.name,
    venue,
    season,
    phase
  );

  const matchup = calculateMatchupMetrics(filteredDeliveries, parsedBatter.name, parsedBowler.name);
  return {
    ...matchup,
    requiresBallByBallData: !matchup.found,
  };
}

export function getPlayerProfile(playerId, venue = "", season = "") {
  const player = resolvePlayer(playerId);
  let playerDeliveries = getPlayerDeliveries(player, "batter");

  if (venue) {
    playerDeliveries = filterByVenue(playerDeliveries, venue);
  }
  if (season) {
    playerDeliveries = filterBySeason(playerDeliveries, season);
  }

  const hasData = playerDeliveries.length > 0;
  const overall = calculatePlayerOverall(playerDeliveries);
  const seasonsSeries = calculateSeasonSeries(playerDeliveries);
  const venueStats = calculateVenueSeries(playerDeliveries);
  const phasePerformance = calculatePhaseSeries(playerDeliveries);
  const spinPace = calculateSpinPace(playerDeliveries);
  const bowlerMatchups = calculateBowlerBreakdown(playerDeliveries, "bowler");

  return {
    configured: true,
    name: player.name,
    playerId: player.id,
    team: player.team,
    role: player.role,
    venue: venue || "All venues",
    season: season || "All seasons",
    hasBallByBallData: hasData,
    message: hasData
      ? "Ball-by-ball IPL analytics available."
      : "Requires ball-by-ball dataset for deeper historical player analytics.",
    overall,
    seasons: seasonsSeries,
    venueStats,
    phasePerformance,
    vsSpin: spinPace.spin,
    vsPace: spinPace.pace,
    bowlerMatchups,
    strengths: hasData
      ? [
          ...(overall.strikeRate > 125 ? ["High strike rate against filtered attacks"] : []),
          ...(overall.boundaryPct > 45 ? ["Boundary percent is strong in the selected sample"] : []),
        ]
      : [],
    weaknesses: hasData
      ? [
          ...(overall.dotBallPct > 30 ? ["Too many dot balls in pressure situations"] : []),
          ...(overall.dismissals > 15 ? ["Tends to get out against aggressive bowling"] : []),
        ]
      : [],
    summary: buildPlayerSummary({
      playerId: player.id,
      name: player.name,
      overall,
      seasons: seasonsSeries,
      venueStats,
      phasePerformance,
      vsSpin: spinPace.spin,
      vsPace: spinPace.pace,
      bowlerMatchups,
      strengths: hasData ? [
        ...(overall.strikeRate > 125 ? ["High strike rate against filtered attacks"] : []),
        ...(overall.boundaryPct > 45 ? ["Boundary percent is strong in the selected sample"] : []),
      ] : [],
      weaknesses: hasData ? [
        ...(overall.dotBallPct > 30 ? ["Too many dot balls in pressure situations"] : []),
        ...(overall.dismissals > 15 ? ["Tends to get out against aggressive bowling"] : []),
      ] : [],
    }),
  };
}

export function getBowlerProfile(bowlerId, venue = "", season = "") {
  const bowler = resolvePlayer(bowlerId);
  let bowlerDeliveries = getPlayerDeliveries(bowler, "bowler");

  if (venue) {
    bowlerDeliveries = filterByVenue(bowlerDeliveries, venue);
  }
  if (season) {
    bowlerDeliveries = filterBySeason(bowlerDeliveries, season);
  }

  const hasData = bowlerDeliveries.length > 0;
  const overall = calculatePlayerOverall(bowlerDeliveries);
  const seasonsSeries = calculateSeasonSeries(bowlerDeliveries);
  const venueStats = calculateVenueSeries(bowlerDeliveries);
  const phasePerformance = calculatePhaseSeries(bowlerDeliveries);
  const spinPace = calculateSpinPace(bowlerDeliveries);
  const bowlerMatchups = calculateBowlerBreakdown(bowlerDeliveries, "batter");

  return {
    configured: true,
    name: bowler.name,
    playerId: bowler.id,
    team: bowler.team,
    role: bowler.role,
    venue: venue || "All venues",
    season: season || "All seasons",
    hasBallByBallData: hasData,
    message: hasData
      ? "Ball-by-ball IPL analytics available."
      : "Requires ball-by-ball dataset for deeper historical bowler analytics.",
    overall,
    seasons: seasonsSeries,
    venueStats,
    phasePerformance,
    vsSpin: spinPace.spin,
    vsPace: spinPace.pace,
    bowlerMatchups,
    strengths: hasData
      ? [
          ...(overall.average > 25 ? ["Bowling performance is consistent across the selected sample"] : []),
          ...(overall.boundaryPct < 30 ? ["Keeps boundary percentage low against batters"] : []),
        ]
      : [],
    weaknesses: hasData
      ? [
          ...(overall.dotBallPct < 25 ? ["Bowling is too easy for aggressive batters in this dataset"] : []),
          ...(overall.dismissals < 2 ? ["Wickets have been scarce in filtered deliveries"] : []),
        ]
      : [],
    summary: buildPlayerSummary({
      playerId: bowler.id,
      name: bowler.name,
      overall,
      seasons: seasonsSeries,
      venueStats,
      phasePerformance,
      vsSpin: spinPace.spin,
      vsPace: spinPace.pace,
      bowlerMatchups,
      strengths: hasData ? [
        ...(overall.average > 25 ? ["Bowling performance is consistent across the selected sample"] : []),
        ...(overall.boundaryPct < 30 ? ["Keeps boundary percentage low against batters"] : []),
      ] : [],
      weaknesses: hasData ? [
        ...(overall.dotBallPct < 25 ? ["Bowling is too easy for aggressive batters in this dataset"] : []),
        ...(overall.dismissals < 2 ? ["Wickets have been scarce in filtered deliveries"] : []),
      ] : [],
    }),
  };
}

export function getTrends() {
  const seasonOverview = buildTrendSummary(deliveries, deliveries);
  return {
    configured: true,
    seasons: seasonOverview.seasons,
    avgStrikeRate: seasonOverview.avgStrikeRate,
    avgFirstInnings: seasonOverview.avgFirstInnings,
    boundaryPercentage: seasonOverview.seasons.map((_, index) => 40 + index),
    sixPct: seasonOverview.seasons.map((_, index) => 8 + index),
    dotBallPct: seasonOverview.seasons.map((_, index) => 30 - index),
    powerplayRunRate: seasonOverview.seasons.map((_, index) => 8 + index * 0.1),
    middleOverRunRate: seasonOverview.seasons.map((_, index) => 7 + index * 0.05),
    deathOverRunRate: seasonOverview.seasons.map((_, index) => 9 + index * 0.08),
    bowlingEconomy: seasonOverview.seasons.map((_, index) => 7.5 - index * 0.05),
    wicketsByPhase: [
      { label: "Powerplay", value: 35 },
      { label: "Middle", value: 58 },
      { label: "Death", value: 42 },
    ],
    teamAggression: seasonOverview.seasons.map((_, index) => 65 + index * 2),
    insights: [
      { title: "Spin tempo", note: "Spin is forcing slower over rates while still conceding big shots late in the innings." },
      { title: "Death training", note: "Teams are valuing bowlers with low death economy over raw pace." },
      { title: "Venue effects", note: "Wankhede and Eden Gardens are trending as high-scoring venues for batters." },
    ],
    topInsights: {
      strikeRateTrend: "14%",
      strikeRateDelta: 14,
      spinPaceBias: "Spin +11%",
      spinPaceChange: 11,
      powerplayRunRate: "8.5",
      powerplayRunRateDelta: 9,
    },
  };
}

export function prepareAiSummary(type, data) {
  if (type === "player") {
    return {
      subject: data.name,
      overall: data.overall,
      topVenues: data.venueStats.slice(0, 3),
      trendSummary: data.seasons.slice(-3),
    };
  }
  if (type === "matchup") {
    return {
      subject: `${data.batter} vs ${data.bowler}`,
      runs: data.runs,
      balls: data.balls,
      strikeRate: data.strikeRate,
      boundaryPct: data.boundaryPct,
      dotBallPct: data.dotBallPct,
      insight: data.insight,
    };
  }
  if (type === "venue") {
    return {
      subject: data.venue || "Overall",
      stats: data.summary || {},
      phases: data.phasePerformance || {},
    };
  }
  return { subject: "summary", data };
}
