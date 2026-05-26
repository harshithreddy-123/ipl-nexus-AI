function sum(values) {
  return values.reduce((total, current) => total + Number(current || 0), 0);
}

function formatPercent(value) {
  return Number(value.toFixed(1));
}

export function calculatePlayerOverall(records) {
  const ballsFaced = records.length;
  const runs = sum(records.map((item) => item.batsman_runs));
  const dismissals = records.filter((item) => item.player_dismissed).length;
  const fours = records.filter((item) => Number(item.batsman_runs) === 4).length;
  const sixes = records.filter((item) => Number(item.batsman_runs) === 6).length;
  const dots = records.filter((item) => Number(item.batsman_runs) === 0).length;
  const strikeRate = ballsFaced ? formatPercent((runs / ballsFaced) * 100) : 0;
  const average = dismissals ? formatPercent(runs / dismissals) : 0;
  const boundaryPct = runs ? formatPercent(((fours * 4 + sixes * 6) / runs) * 100) : 0;
  const dotBallPct = ballsFaced ? formatPercent((dots / ballsFaced) * 100) : 0;

  return {
    runs,
    ballsFaced,
    strikeRate,
    average,
    dismissals,
    fours,
    sixes,
    boundaryPct,
    dotBallPct,
  };
}

export function calculateSeasonSeries(records) {
  const seasons = {};
  records.forEach((item) => {
    const key = item.season || "Unknown";
    if (!seasons[key]) {
      seasons[key] = { season: key, runs: 0, ballsFaced: 0, dismissals: 0, fours: 0, sixes: 0 };
    }
    seasons[key].runs += Number(item.batsman_runs || 0);
    seasons[key].ballsFaced += 1;
    seasons[key].dismissals += item.player_dismissed ? 1 : 0;
    seasons[key].fours += Number(item.batsman_runs) === 4 ? 1 : 0;
    seasons[key].sixes += Number(item.batsman_runs) === 6 ? 1 : 0;
  });
  return Object.values(seasons).map((summary) => ({
    season: summary.season,
    runs: summary.runs,
    strikeRate: summary.ballsFaced ? formatPercent((summary.runs / summary.ballsFaced) * 100) : 0,
    average: summary.dismissals ? formatPercent(summary.runs / summary.dismissals) : 0,
    boundaryPct: summary.runs ? formatPercent(((summary.fours * 4 + summary.sixes * 6) / summary.runs) * 100) : 0,
    ballsFaced: summary.ballsFaced,
  }));
}

export function calculateVenueSeries(records) {
  const venues = {};
  records.forEach((item) => {
    const key = item.venue || "Unknown";
    if (!venues[key]) {
      venues[key] = { venue: key, runs: 0, ballsFaced: 0, dismissals: 0 };
    }
    venues[key].runs += Number(item.batsman_runs || 0);
    venues[key].ballsFaced += 1;
    venues[key].dismissals += item.player_dismissed ? 1 : 0;
  });
  return Object.values(venues).map((summary) => ({
    venue: summary.venue,
    runs: summary.runs,
    strikeRate: summary.ballsFaced ? formatPercent((summary.runs / summary.ballsFaced) * 100) : 0,
    average: summary.dismissals ? formatPercent(summary.runs / summary.dismissals) : 0,
  }));
}

export function calculatePhaseSeries(records) {
  const phases = {};
  records.forEach((item) => {
    const key = item.phase || "Unknown";
    if (!phases[key]) {
      phases[key] = { phase: key, runs: 0, ballsFaced: 0, dismissals: 0 };
    }
    phases[key].runs += Number(item.batsman_runs || 0);
    phases[key].ballsFaced += 1;
    phases[key].dismissals += item.player_dismissed ? 1 : 0;
  });
  return Object.values(phases).reduce((acc, summary) => {
    acc[summary.phase] = {
      runs: summary.runs,
      strikeRate: summary.ballsFaced ? formatPercent((summary.runs / summary.ballsFaced) * 100) : 0,
      average: summary.dismissals ? formatPercent(summary.runs / summary.dismissals) : 0,
    };
    return acc;
  }, {});
}

export function calculateSpinPace(records) {
  const spin = records.filter((item) => item.bowling_type && item.bowling_type.toLowerCase().includes("spin"));
  const pace = records.filter((item) => item.bowling_type && item.bowling_type.toLowerCase().includes("pace"));
  return {
    spin: calculatePlayerOverall(spin),
    pace: calculatePlayerOverall(pace),
  };
}

export function calculateBowlerBreakdown(records, opponentType = "bowler") {
  const buckets = {};
  records.forEach((item) => {
    const key = opponentType === "bowler" ? item.bowler : item.batter;
    if (!key) return;
    if (!buckets[key]) {
      buckets[key] = { opponent: key, runs: 0, balls: 0, dismissals: 0 };
    }
    buckets[key].runs += Number(item.batsman_runs || 0);
    buckets[key].balls += 1;
    buckets[key].dismissals += item.player_dismissed ? 1 : 0;
  });
  return Object.values(buckets)
    .map((item) => ({
      ...item,
      strikeRate: item.balls ? formatPercent((item.runs / item.balls) * 100) : 0,
    }))
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 6);
}

export function buildPlayerSummary(profile) {
  return {
    playerId: profile.playerId,
    name: profile.name,
    overall: profile.overall,
    topVenue: profile.venueStats[0] ? profile.venueStats[0].venue : "All venues",
    topSeason: profile.seasons[0] ? profile.seasons[0].season : "All seasons",
    strengths: profile.strengths,
    weaknesses: profile.weaknesses,
  };
}
