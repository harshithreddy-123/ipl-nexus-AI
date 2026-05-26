const MOCK_LIVE_MATCH = {
  id: "IPL2024_MI_CSK_1",
  matchNumber: 1,
  league: "IPL 2024",
  status: "Live",
  statusText: "MI require 49 runs in 8 overs",

  teamBatting: {
    id: "MI",
    name: "Mumbai Indians",
    shortName: "MI",
    logo: "🔵",
  },
  teamBowling: {
    id: "CSK",
    name: "Chennai Super Kings",
    shortName: "CSK",
    logo: "🟡",
  },

  venue: "Wankhede Stadium, Mumbai",
  toss: "CSK won the toss and elected to bat",

  innings: [
    {
      inningsNumber: 1,
      team: "CSK",
      score: 178,
      wickets: 6,
      overs: 20,
      ballsBowled: 120,
      runRate: 8.9,
      target: null,
      extras: 12,
      batsmen: [
        { name: "R. Gaikwad", runs: 45, balls: 32, fours: 3, sixes: 2, strikeRate: 140.6, out: false, dismissal: null },
        { name: "S. Smith", runs: 38, balls: 28, fours: 4, sixes: 1, strikeRate: 135.7, out: false, dismissal: null },
        { name: "M. Dhoni", runs: 32, balls: 22, fours: 2, sixes: 2, strikeRate: 145.5, out: false, dismissal: null },
        { name: "A. Raina", runs: 21, balls: 16, fours: 2, sixes: 1, strikeRate: 131.3, out: true, dismissal: "c Sharma b Bumrah" },
        { name: "S. Curran", runs: 18, balls: 14, fours: 1, sixes: 1, strikeRate: 128.6, out: false, dismissal: null },
      ],
      bowlers: [
        { name: "J. Bumrah", overs: 4, maidens: 0, runs: 28, wickets: 1, economy: 7.0, balls: 24 },
        { name: "N. Coulter-Nile", overs: 4, maidens: 1, runs: 32, wickets: 1, economy: 8.0, balls: 24 },
        { name: "L. Boult", overs: 3, maidens: 0, runs: 24, wickets: 1, economy: 8.0, balls: 18 },
        { name: "R. Sharma", overs: 3, maidens: 1, runs: 18, wickets: 1, economy: 6.0, balls: 18 },
        { name: "H. Pandya", overs: 4, maidens: 0, runs: 35, wickets: 0, economy: 8.75, balls: 24 },
      ],
      fallOfWickets: [
        { wicketNumber: 1, playerName: "A. Raina", runs: 125, overs: 18.2 },
      ],
    },
  ],

  currentInnings: {
    inningsNumber: 2,
    team: "MI",
    score: 130,
    wickets: 4,
    overs: 12.4,
    ballsBowled: 76,
    runRate: 10.3,
    target: 179,
    requiredRunRate: 12.1,
    extras: 8,
    batsmen: [
      { name: "R. Sharma", runs: 52, balls: 35, fours: 5, sixes: 1, strikeRate: 148.6, isStriker: false, dismissal: null },
      { name: "I. Kishan", runs: 18, balls: 14, fours: 2, sixes: 0, strikeRate: 128.6, isStriker: true, dismissal: null },
      { name: "T. David", runs: 34, balls: 22, fours: 3, sixes: 2, strikeRate: 154.5, isStriker: false, dismissal: null },
      { name: "A. Pandey", runs: 8, balls: 6, fours: 1, sixes: 0, strikeRate: 133.3, isStriker: false, dismissal: null },
      { name: "P. Mukherjee", runs: 0, balls: 2, fours: 0, sixes: 0, strikeRate: 0, isStriker: false, dismissal: null },
    ],
    bowlers: [
      { name: "M. Theekshana", overs: 3, maidens: 0, runs: 28, wickets: 1, economy: 9.33, balls: 18, isCurrent: false },
      { name: "R. Jadeja", overs: 2.4, maidens: 0, runs: 24, wickets: 2, economy: 9.0, balls: 16, isCurrent: true },
      { name: "D. Chahar", overs: 2, maidens: 0, runs: 18, wickets: 0, economy: 9.0, balls: 12, isCurrent: false },
      { name: "S. Curran", overs: 2, maidens: 0, runs: 22, wickets: 0, economy: 11.0, balls: 12, isCurrent: false },
      { name: "M. Dhoni", overs: 2.2, maidens: 1, runs: 16, wickets: 0, economy: 6.86, balls: 14, isCurrent: false },
    ],
    recentBalls: [6, 1, 4, 0, "W", 1, 4, 2, 1, 1, 6, 4],
    partnership: {
      runs: 52,
      balls: 34,
      batter1: "I. Kishan",
      batter2: "T. David",
    },
    lastWicket: {
      playerName: "P. Mukherjee",
      dismissal: "c Sharma b Jadeja",
      overs: 12.1,
      runs: 0,
    },
  },

  commentary: [
    { over: 12, ball: 4, batter: "I. Kishan", bowler: "R. Jadeja", text: "SIX! Short delivery, Kishan pulls it over mid-wicket!", type: "six" },
    { over: 12, ball: 3, batter: "I. Kishan", bowler: "R. Jadeja", text: "Four! Drive through covers, beautiful shot", type: "four" },
    { over: 12, ball: 2, batter: "I. Kishan", bowler: "R. Jadeja", text: "Dot ball, defended", type: "dot" },
    { over: 12, ball: 1, batter: "I. Kishan", bowler: "R. Jadeja", text: "Single! Easy push to mid-on", type: "run" },
    { over: 11, ball: 6, batter: "T. David", bowler: "S. Curran", text: "Four! Driven through extra cover", type: "four" },
    { over: 11, ball: 5, batter: "T. David", bowler: "S. Curran", text: "WICKET! P. Mukherjee caught at slip. CSK are fighting back!", type: "wicket" },
    { over: 11, ball: 4, batter: "P. Mukherjee", bowler: "S. Curran", text: "Dot ball", type: "dot" },
    { over: 11, ball: 3, batter: "P. Mukherjee", bowler: "S. Curran", text: "Single", type: "run" },
  ],
};

export const liveMatchService = {
  async getLiveMatch() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: MOCK_LIVE_MATCH,
        });
      }, 800);
    });
  },

  async refreshMatch() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updated = { ...MOCK_LIVE_MATCH };
        updated.currentInnings.score += Math.floor(Math.random() * 4);
        updated.currentInnings.overs += 0.1;
        updated.currentInnings.runRate = (updated.currentInnings.score / (updated.currentInnings.overs * 6) * 100).toFixed(1);
        resolve({
          success: true,
          data: updated,
        });
      }, 600);
    });
  },

  getMockData() {
    return MOCK_LIVE_MATCH;
  },
};
