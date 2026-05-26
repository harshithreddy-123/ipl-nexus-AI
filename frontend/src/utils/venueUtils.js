export function filterByVenue(deliveries, venue) {
  if (!venue || venue === "All venues") {
    return deliveries;
  }
  return deliveries.filter((item) => String(item.venue || "").trim().toLowerCase() === String(venue || "").trim().toLowerCase());
}

export function calculateVenueSummary(records) {
  const runs = records.reduce((sum, item) => sum + Number(item.batsman_runs || 0), 0);
  const balls = records.length;
  const wickets = records.filter((item) => item.player_dismissed).length;
  return {
    runs,
    balls,
    wickets,
    strikeRate: balls ? Number(((runs / balls) * 100).toFixed(1)) : 0,
    average: wickets ? Number((runs / wickets).toFixed(1)) : 0,
  };
}

export function getVenueTrendByPhase(records) {
  const phases = {};
  records.forEach((item) => {
    const phase = item.phase || "Unknown";
    if (!phases[phase]) {
      phases[phase] = { runs: 0, balls: 0, wickets: 0 };
    }
    phases[phase].runs += Number(item.batsman_runs || 0);
    phases[phase].balls += 1;
    phases[phase].wickets += item.player_dismissed ? 1 : 0;
  });
  return Object.entries(phases).reduce((acc, [phase, summary]) => {
    acc[phase] = {
      runs: summary.runs,
      strikeRate: summary.balls ? Number(((summary.runs / summary.balls) * 100).toFixed(1)) : 0,
      wickets: summary.wickets,
    };
    return acc;
  }, {});
}
