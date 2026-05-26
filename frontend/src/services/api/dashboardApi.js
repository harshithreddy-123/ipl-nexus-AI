import cricketApi from './cricketApi';

export async function getOverview() {
  try {
    const data = await cricketApi.getSummary();
    // Provide safe defaults for fields backend may not include yet
    return {
      totalMatches: data.total_matches ?? data.totalMatches ?? 0,
      totalPlayers: data.total_players ?? data.totalPlayers ?? 0,
      totalTeams: data.total_teams ?? data.totalTeams ?? 0,
      totalVenues: data.total_venues ?? data.totalVenues ?? 0,
      totalRuns: data.total_runs ?? data.totalRuns ?? 0,
      totalWickets: data.total_wickets ?? data.totalWickets ?? 0,
      seasons: data.seasons ?? 0,
      liveMatchStatus: data.live_match_status ?? data.liveMatchStatus ?? '',
      raw: data,
    };
  } catch (err) {
    const e = new Error(err.message || 'Failed to fetch overview');
    e.cause = err;
    throw e;
  }
}

export default { getOverview };
