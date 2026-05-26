function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
}

export function filterDeliveriesByMatchup(deliveries, batter, bowler, venue = "", season = "", phase = "") {
  return deliveries.filter((delivery) => {
    if (batter && normalizeValue(delivery.batter) !== normalizeValue(batter)) {
      return false;
    }
    if (bowler && normalizeValue(delivery.bowler) !== normalizeValue(bowler)) {
      return false;
    }
    if (venue && normalizeValue(delivery.venue) !== normalizeValue(venue)) {
      return false;
    }
    if (season && normalizeValue(delivery.season) !== normalizeValue(season)) {
      return false;
    }
    if (phase && normalizeValue(delivery.phase) !== normalizeValue(phase)) {
      return false;
    }
    return true;
  });
}

export function calculateMatchupMetrics(deliveries, batter, bowler) {
  const balls = deliveries.length;
  const runs = deliveries.reduce((sum, item) => sum + Number(item.batsman_runs || 0), 0);
  const fours = deliveries.filter((item) => Number(item.batsman_runs) === 4).length;
  const sixes = deliveries.filter((item) => Number(item.batsman_runs) === 6).length;
  const dots = deliveries.filter((item) => Number(item.batsman_runs) === 0).length;
  const dismissals = deliveries.filter((item) => item.player_dismissed).length;
  const strikeRate = balls ? Number(((runs / balls) * 100).toFixed(1)) : 0;
  const boundaryPct = runs ? Number((((fours * 4 + sixes * 6) / runs) * 100).toFixed(1)) : 0;
  const dotBallPct = balls ? Number(((dots / balls) * 100).toFixed(1)) : 0;
  const recentTrend = deliveries.slice(-6).map((item) => Number(item.batsman_runs || 0));
  const insight = deliveries.length
    ? `${batter} has scored ${runs} runs off ${bowler} in this filter, including ${fours} fours and ${sixes} sixes.`
    : `No deliveries found for ${batter} vs ${bowler} under the chosen filters.`;

  return {
    found: balls > 0,
    batter,
    bowler,
    runs,
    balls,
    fours,
    sixes,
    strikeRate,
    boundaryPct,
    dotBallPct,
    dots,
    dismissals,
    recentTrend,
    insight,
    riskRating: balls ? `${Math.min(100, Math.round((runs / balls) * 4 + dots / 2))}%` : "0%",
  };
}
