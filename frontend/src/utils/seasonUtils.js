export function filterBySeason(deliveries, season) {
  if (!season || season === "All seasons") {
    return deliveries;
  }
  return deliveries.filter((item) => String(item.season || "").trim() === String(season).trim());
}

export function summarizeSeasonMetrics(records) {
  const seasons = {};
  records.forEach((item) => {
    const key = String(item.season || "Unknown");
    if (!seasons[key]) {
      seasons[key] = { season: key, runs: 0, balls: 0, wickets: 0, dots: 0 };
    }
    seasons[key].runs += Number(item.batsman_runs || 0);
    seasons[key].balls += 1;
    seasons[key].wickets += item.player_dismissed ? 1 : 0;
    seasons[key].dots += Number(item.batsman_runs || 0) === 0 ? 1 : 0;
  });
  return Object.values(seasons).map((summary) => ({
    season: summary.season,
    runs: summary.runs,
    strikeRate: summary.balls ? Number(((summary.runs / summary.balls) * 100).toFixed(1)) : 0,
    wickets: summary.wickets,
    dotPct: summary.balls ? Number(((summary.dots / summary.balls) * 100).toFixed(1)) : 0,
  }));
}

export function buildTrendSummary(matches, deliveries) {
  const seasons = Array.from(new Set(deliveries.map((item) => item.season).filter(Boolean))).sort();
  return {
    seasons,
    avgStrikeRate: seasons.map((season) => {
      const seasonDeliveries = deliveries.filter((item) => String(item.season) === String(season));
      const runs = seasonDeliveries.reduce((sum, item) => sum + Number(item.batsman_runs || 0), 0);
      const balls = seasonDeliveries.length;
      return balls ? Number(((runs / balls) * 100).toFixed(1)) : 0;
    }),
    avgFirstInnings: seasons.map((season) => {
      const firstInnings = deliveries.filter((item) => String(item.season) === String(season) && item.innings === 1);
      return firstInnings.length ? Number((firstInnings.reduce((sum, item) => sum + Number(item.batsman_runs || 0), 0) / firstInnings.length).toFixed(1)) : 0;
    }),
  };
}
