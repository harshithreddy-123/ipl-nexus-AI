export function StatsTab({ currentInnings }) {
  const totalRuns = currentInnings.score;
  const totalBalls = currentInnings.ballsBowled;

  const getRunsInPhase = (start, end) => {
    return Math.floor(totalRuns * ((end - start) / totalBalls));
  };

  const powerPlay = getRunsInPhase(0, 6);
  const middleOvers = getRunsInPhase(6, 15);
  const deathOvers = getRunsInPhase(15, totalBalls);

  return (
    <div className="space-y-6">
      {/* Run Rate Graph */}
      <div className="card p-4 space-y-3">
        <div className="text-sm font-semibold text-gray-300">Run Rate Progression</div>

        <div className="h-40 flex items-end justify-between gap-1 px-2">
          {[8.2, 8.5, 9.1, 9.3, 9.8, 10.2, 10.5, 10.3, 10.1, 9.9, 10.2, 10.3].map((rate, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-lg bg-gradient-to-t from-ipl-orange to-ipl-cyan/60 relative group"
              style={{ height: `${(rate / 11) * 100}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/80 px-2 py-1 rounded text-2xs text-white whitespace-nowrap">
                {rate.toFixed(1)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-2xs text-gray-400">
          <span>Over 1</span>
          <span>Over 6 (PP)</span>
          <span>Over 15</span>
          <span>Current</span>
        </div>
      </div>

      {/* Phase Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center space-y-2">
          <div className="text-2xs font-semibold text-gray-400 uppercase">PowerPlay (0-6)</div>
          <div className="text-3xl font-bold text-ipl-cyan">{powerPlay}</div>
          <div className="text-2xs text-gray-400">runs • {(powerPlay / 6).toFixed(1)} RR</div>
        </div>

        <div className="card p-4 text-center space-y-2">
          <div className="text-2xs font-semibold text-gray-400 uppercase">Middle (7-15)</div>
          <div className="text-3xl font-bold text-ipl-orange">{middleOvers}</div>
          <div className="text-2xs text-gray-400">runs • {(middleOvers / 9).toFixed(1)} RR</div>
        </div>

        <div className="card p-4 text-center space-y-2">
          <div className="text-2xs font-semibold text-gray-400 uppercase">Death (16+)</div>
          <div className="text-3xl font-bold text-yellow-400">{deathOvers}</div>
          <div className="text-2xs text-gray-400">runs • {(deathOvers * 6 / (totalBalls - 90)).toFixed(1)} RR</div>
        </div>
      </div>

      {/* Partnership Chart */}
      <div className="card p-4 space-y-3">
        <div className="text-sm font-semibold text-gray-300">Top Partnerships</div>

        {[
          { bat1: "R. Sharma", bat2: "T. David", runs: 52, balls: 34 },
          { bat1: "R. Sharma", bat2: "I. Kishan", runs: 38, balls: 24 },
          { bat1: "I. Kishan", bat2: "A. Pandey", runs: 21, balls: 16 },
        ].map((partnership, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-200 font-medium">
                {partnership.bat1} & {partnership.bat2}
              </span>
              <span className="text-ipl-cyan font-bold">{partnership.runs}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-ipl-cyan to-ipl-orange rounded-full" style={{ width: `${(partnership.runs / 60) * 100}%` }} />
            </div>
            <div className="text-2xs text-gray-400">{partnership.balls} balls • {((partnership.runs / partnership.balls) * 100).toFixed(1)} SR</div>
          </div>
        ))}
      </div>

      {/* Wagon Wheel Placeholder */}
      <div className="card p-8 space-y-3">
        <div className="text-sm font-semibold text-gray-300">Wagon Wheel</div>

        <div className="flex items-center justify-center h-40 bg-black/40 rounded-xl">
          <div className="text-center">
            <div className="text-4xl opacity-40">⚪</div>
            <p className="text-2xs text-gray-500 mt-2">Detailed shot map coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
