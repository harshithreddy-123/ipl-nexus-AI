const SUMMARY = {
  keyInsight: "Powerplay aggression is reshaping IPL innings construction.",
  topTrend: "T20 strike rate is climbing while dot ball suppression improves.",
  mostImprovedSR: "Player SR improvements now exceed 15% year-over-year.",
  bestDeathOversBatter: "Rohit Sharma leads finishers in death overs scoring.",
  bestPowerplayBowler: "Spin bowlers are holding powerplay economy under 7.2.",
  spinPaceBias: "Spin scoring has become 10% more effective than pace.",
  seasons: ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
};

const PLAYERS = {
  batter: [
    { id: 'vk', name: 'Virat Kohli' },
    { id: 'ab', name: 'AB de Villiers' },
    { id: 'rg', name: 'Rohit Sharma' },
    { id: 'ss', name: 'Suryakumar Yadav' },
    { id: 'dh', name: 'David Warner' },
  ],
  bowler: [
    { id: 'jb', name: 'Jasprit Bumrah' },
    { id: 'sr', name: 'Sunil Narine' },
    { id: 'ym', name: 'Yuzvendra Chahal' },
    { id: 'kk', name: 'Kagiso Rabada' },
    { id: 'rz', name: 'Rashid Khan' },
  ],
};

function players(role) {
  return { players: PLAYERS[role] || [] };
}

function matchup(batter, bowler, filters = {}) {
  const key = `${batter}-${bowler}-${filters.venue || 'all'}-${filters.season || 'all'}-${filters.phase || 'all'}`;
  const seed = Math.abs(hash(key));
  const runs = Math.max(0, Math.floor((seed % 110) + 20));
  const balls = Math.max(1, Math.floor(((seed + 43) % 90) + 10));
  const fours = Math.floor((seed % 14) + 3);
  const sixes = Math.floor((seed % 7) + 1);
  const dots = Math.floor((seed % 35) + 5);
  const dismissals = Math.floor((seed % 4) + 0);
  const sr = ((runs / balls) * 100).toFixed(1);
  const boundaryPct = (((fours * 4 + sixes * 6) / Math.max(runs, 1)) * 100).toFixed(1);
  const dotPct = ((dots / balls) * 100).toFixed(1);

  return {
    matchup: {
      runs,
      balls,
      fours,
      sixes,
      dots,
      dismissals,
      strikeRate: Number(sr),
      boundaryPct: Number(boundaryPct),
      dotBallPct: Number(dotPct),
      venue: filters.venue || "All venues",
      season: filters.season || "All seasons",
      phase: filters.phase || "All phases",
      recentTrend: [
        Math.max(0, runs - 5),
        runs,
        Math.min(150, runs + 6),
        runs + 3,
      ],
      insight: `${batter} has attacked ${bowler} with ${fours + sixes} boundaries in this filter.`,
      riskRating: `${Math.min(100, Math.floor((runs / balls) * 45 + dots / 2))}%`,
    },
  };
}

function liveScores() {
  return {
    configured: false,
    message: 'Mock live scores active',
    matches: [
      {
        status: 'LIVE',
        venue: 'Wankhede',
        phase: 'Death overs',
        teamNames: ['Mumbai Indians', 'Chennai Super Kings'],
        scoreA: '165/5 (17.2)',
        scoreB: '148/6 (20)',
        runRate: '9.35',
        lastBall: '6',
        lead: '17 required',
        nextBowler: 'Jasprit Bumrah',
        previousBalls: ['1', 'W', '4', '0', '6', '2', '1', '4'],
        comment: 'MI needs 17 runs from 16 balls with momentum on their side.',
      },
      {
        status: 'LIVE',
        venue: 'MCA Stadium',
        phase: 'Final over',
        teamNames: ['Royal Challengers Bangalore', 'Kolkata Knight Riders'],
        scoreA: '189/3 (18.0)',
        scoreB: '183/7 (20)',
        runRate: '10.50',
        lastBall: '1',
        lead: '6 ahead',
        nextBowler: 'Varun Chakravarthy',
        previousBalls: ['0', '4', '1', 'W', '2', '1', '1', '4'],
        comment: 'RCB closing in on a narrow chase under lights.',
      },
    ],
  };
}

function chatReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('kohli') && lower.includes('spin')) {
    return { reply: 'Kohli scores roughly 20% higher strike rate against spin in Bangalore-style venues.' };
  }
  if (lower.includes('bumrah') && lower.includes('death')) {
    return { reply: 'Bumrah maintains a death economy below 6.8 while facing right-hand power hitters.' };
  }
  if (lower.includes('venue') && lower.includes('spinners')) {
    return { reply: 'Wankhede and M. Chinnaswamy reward wrist spinners with higher scoring rates.' };
  }
  if (lower.includes('dominate') && lower.includes('narine')) {
    return { reply: 'Left-handers typically score faster against Narine, while right-handers play more conservatively.' };
  }
  return { reply: `Mock analytics assistant: I can help answer ${message}.` };
}

function playerProfile(playerId, venue = '', season = '') {
  const base = {
    playerId,
    name: PLAYERS.batter.find((player) => player.id === playerId)?.name || 'Unknown batter',
    overall: {
      runs: 5821,
      strikeRate: 137.2,
      average: 39.8,
      boundaryPct: 44.1,
      dotBallPct: 27.9,
      ballsFaced: 4243,
      dismissals: 150,
    },
    seasons: [
      { season: '2015', runs: 278, sr: 123.4 },
      { season: '2016', runs: 324, sr: 129.7 },
      { season: '2017', runs: 402, sr: 134.1 },
      { season: '2018', runs: 458, sr: 139.8 },
      { season: '2019', runs: 516, sr: 142.5 },
      { season: '2020', runs: 529, sr: 145.3 },
      { season: '2021', runs: 438, sr: 137.0 },
      { season: '2022', runs: 502, sr: 140.6 },
      { season: '2023', runs: 551, sr: 147.3 },
      { season: '2024', runs: 470, sr: 150.2 },
    ],
    vsSpin: { runs: 3100, strikeRate: 143.7, average: 43.9 },
    vsPace: { runs: 2721, strikeRate: 132.4, average: 36.5 },
    bowlerMatchups: [
      { bowler: 'Jasprit Bumrah', runs: 312, sr: 132.1, dismissals: 10 },
      { bowler: 'Yuzvendra Chahal', runs: 256, sr: 146.3, dismissals: 4 },
      { bowler: 'Sunil Narine', runs: 180, sr: 138.7, dismissals: 2 },
    ],
    venueStats: [
      { venue: 'Wankhede', runs: 926, strikeRate: 149.1 },
      { venue: 'Eden Gardens', runs: 812, strikeRate: 136.4 },
      { venue: 'MCA Stadium', runs: 672, strikeRate: 142.0 },
    ],
    phasePerformance: {
      powerplay: { runs: 1238, strikeRate: 145.2 },
      middle: { runs: 2434, strikeRate: 136.9 },
      death: { runs: 2149, strikeRate: 158.3 },
    },
    strengths: [
      'Dominates spin in middle overs',
      'Strong late-innings acceleration',
    ],
    weaknesses: [
      'Short ball against in-swinging pacers',
      'Lower conversion rate versus top-quality pace',
    ],
  };

  if (venue) {
    base.overall = {
      runs: base.venueStats.find((item) => item.venue === venue)?.runs || 0,
      strikeRate: base.venueStats.find((item) => item.venue === venue)?.strikeRate || 0,
      average: Number((base.overall.average * 0.92).toFixed(1)),
      boundaryPct: Number((base.overall.boundaryPct * 0.95).toFixed(1)),
      dotBallPct: Number((base.overall.dotBallPct * 1.03).toFixed(1)),
      ballsFaced: Math.max(0, Math.floor(base.overall.ballsFaced * 0.23)),
      dismissals: Math.max(0, Math.floor(base.overall.dismissals * 0.24)),
    };
    base.venue = venue;
    base.insight = `Selected venue performance at ${venue} reveals a stronger strike rate and controlled scoring.`;
  }

  if (season) {
    base.seasons = base.seasons.filter((item) => item.season === season);
    base.overall = {
      ...base.overall,
      runs: base.seasons[0]?.runs || base.overall.runs,
      strikeRate: base.seasons[0]?.sr || base.overall.strikeRate,
      average: Number((base.overall.average * 0.94).toFixed(1)),
    };
    base.season = season;
  }

  return base;
}

function bowlerProfile(bowlerId, venue = '', season = '') {
  const base = {
    bowlerId,
    name: PLAYERS.bowler.find((player) => player.id === bowlerId)?.name || 'Unknown bowler',
    overall: {
      economy: 7.1,
      strikeRate: 18.4,
      average: 25.8,
      dotBallPct: 23.5,
      boundaryPct: 16.2,
      wickets: 189,
      economyChange: -0.3,
      strikeRateChange: -1.2,
      averageChange: -0.8,
    },
    phaseEconomy: {
      Powerplay: 6.8,
      Middle: 7.0,
      Death: 7.9,
    },
    styleInsight: 'Prefers attacking the stumps with slower balls and bounce variations.',
    bestAgainst: 'Right-hand power hitters',
    topVenue: 'MCA Stadium',
    bestPhase: 'Death overs',
    strategyInsights: {
      attackOrControl: 'This bowler balances wicket-taking with dot-ball control.',
      phaseType: 'Most effective in death overs using slower balls.',
      pitchPreference: 'Strong on surfaces that aid seam and slower deliveries.',
    },
    seasonTrend: [
      { season: '2015', economy: 7.2, wickets: 16 },
      { season: '2016', economy: 7.0, wickets: 18 },
      { season: '2017', economy: 7.3, wickets: 20 },
      { season: '2018', economy: 6.9, wickets: 19 },
      { season: '2019', economy: 6.8, wickets: 22 },
      { season: '2020', economy: 7.1, wickets: 21 },
      { season: '2021', economy: 6.7, wickets: 24 },
      { season: '2022', economy: 6.5, wickets: 23 },
      { season: '2023', economy: 6.4, wickets: 26 },
      { season: '2024', economy: 6.2, wickets: 28 },
    ],
    batterRecords: [
      { batter: 'Virat Kohli', runs: 218, sr: 127.1, wickets: 2 },
      { batter: 'Rohit Sharma', runs: 186, sr: 119.6, wickets: 1 },
      { batter: 'AB de Villiers', runs: 204, sr: 132.8, wickets: 0 },
    ],
  };

  if (venue) {
    base.overall.economy = Number((base.overall.economy + 0.2).toFixed(1));
    base.topVenue = venue;
    base.venue = venue;
  }

  if (season) {
    base.seasonTrend = base.seasonTrend.filter((item) => item.season === season);
    base.overall = {
      ...base.overall,
      economy: base.seasonTrend[0]?.economy || base.overall.economy,
      wickets: base.seasonTrend[0]?.wickets || base.overall.wickets,
    };
    base.season = season;
  }

  return base;
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

export default {
  summary: SUMMARY,
  players,
  matchup,
  liveScores,
  chatReply,
  trends,
  playerProfile,
  bowlerProfile,
};

function trends() {
  return {
    seasons: SUMMARY.seasons,
    avgStrikeRate: [122.4, 124.8, 126.9, 128.7, 130.1, 131.8, 133.3, 135.0, 137.2, 139.9],
    avgFirstInnings: [156, 162, 168, 172, 177, 181, 185, 188, 192, 196],
    boundaryPercentage: [44, 45.1, 45.8, 46.5, 47.2, 48.0, 48.7, 49.0, 49.8, 50.3],
    sixPct: [11.4, 11.8, 12.3, 12.9, 13.5, 14.1, 14.6, 15.0, 15.4, 16.0],
    dotBallPct: [28.2, 27.9, 27.5, 27.3, 27.0, 26.8, 26.5, 26.2, 25.9, 25.5],
    powerplayRunRate: [7.5, 7.7, 7.9, 8.0, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6],
    middleOverRunRate: [6.8, 6.9, 7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7],
    deathOverRunRate: [9.8, 10.1, 10.5, 10.8, 11.0, 11.3, 11.6, 11.9, 12.2, 12.5],
    spinPaceScoring: [0.92, 0.93, 0.95, 0.97, 0.98, 1.00, 1.03, 1.05, 1.08, 1.10],
    bowlingEconomy: [7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.9, 6.8, 6.7],
    teamAggression: [72, 74, 75, 76, 77, 79, 81, 83, 84, 86],
    insights: [
      { title: "Spin Surge", note: "Spin scoring up 10% while pace control becomes a premium skill." },
      { title: "Powerplay push", note: "Teams are extracting more runs from overs 1-6 with bigger risk reward." },
      { title: "Death over mastery", note: "Closed-out overs now require a blend of yorkers and slower balls." },
      { title: "Venue volatility", note: "Venue surfaces are dictating which batsmen thrive under pressure." },
    ],
    wicketsByPhase: [12, 18, 22],
  };
}
