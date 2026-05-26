export function ScorecardTab({ innings }) {
  return (
    <div className="space-y-6">
      {/* Batting Scorecard */}
      <div className="card p-4 space-y-3">
        <div className="text-sm font-semibold text-gray-300">Batting</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-2 text-2xs font-semibold text-gray-400">Batter</th>
                <th className="text-center py-2 px-1 text-2xs font-semibold text-gray-400">R</th>
                <th className="text-center py-2 px-1 text-2xs font-semibold text-gray-400">B</th>
                <th className="text-center py-2 px-1 text-2xs font-semibold text-gray-400">4s</th>
                <th className="text-center py-2 px-1 text-2xs font-semibold text-gray-400">6s</th>
                <th className="text-center py-2 px-1 text-2xs font-semibold text-gray-400">SR</th>
                <th className="text-left py-2 px-2 text-2xs font-semibold text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {innings.batsmen.map((batter, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-2 font-medium text-gray-200 text-sm">{batter.name}</td>
                  <td className="py-2 px-1 text-center text-ipl-cyan font-bold">{batter.runs}</td>
                  <td className="py-2 px-1 text-center text-gray-300">{batter.balls}</td>
                  <td className="py-2 px-1 text-center text-ipl-orange">{batter.fours}</td>
                  <td className="py-2 px-1 text-center text-yellow-400">{batter.sixes}</td>
                  <td className="py-2 px-1 text-center text-gray-400 text-2xs">{batter.strikeRate.toFixed(1)}</td>
                  <td className="py-2 px-2 text-left text-2xs">
                    {batter.out ? (
                      <span className="text-red-400">{batter.dismissal}</span>
                    ) : (
                      <span className="text-green-400">not out</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="border-t border-white/10 pt-3 grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-2xs text-gray-400">Total</div>
            <div className="font-bold text-white text-lg">{innings.score}/{innings.wickets}</div>
          </div>
          <div>
            <div className="text-2xs text-gray-400">Overs</div>
            <div className="font-bold text-white text-lg">{innings.overs}</div>
          </div>
          <div>
            <div className="text-2xs text-gray-400">Extras</div>
            <div className="font-bold text-white text-lg">{innings.extras}</div>
          </div>
        </div>
      </div>

      {/* Bowling Scorecard */}
      <div className="card p-4 space-y-3">
        <div className="text-sm font-semibold text-gray-300">Bowling</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-2 text-2xs font-semibold text-gray-400">Bowler</th>
                <th className="text-center py-2 px-1 text-2xs font-semibold text-gray-400">O</th>
                <th className="text-center py-2 px-1 text-2xs font-semibold text-gray-400">M</th>
                <th className="text-center py-2 px-1 text-2xs font-semibold text-gray-400">R</th>
                <th className="text-center py-2 px-1 text-2xs font-semibold text-gray-400">W</th>
                <th className="text-center py-2 px-1 text-2xs font-semibold text-gray-400">Economy</th>
              </tr>
            </thead>
            <tbody>
              {innings.bowlers.map((bowler, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-2 font-medium text-gray-200 text-sm">{bowler.name}</td>
                  <td className="py-2 px-1 text-center text-gray-300">{bowler.overs.toFixed(1)}</td>
                  <td className="py-2 px-1 text-center text-gray-300">{bowler.maidens}</td>
                  <td className="py-2 px-1 text-center text-ipl-cyan font-bold">{bowler.runs}</td>
                  <td className="py-2 px-1 text-center text-ipl-orange font-bold">{bowler.wickets}</td>
                  <td className="py-2 px-1 text-center text-gray-400 text-2xs">{bowler.economy.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fall of Wickets */}
      {innings.fallOfWickets && innings.fallOfWickets.length > 0 && (
        <div className="card p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-300">Fall of Wickets</div>

          <div className="space-y-2">
            {innings.fallOfWickets.map((fow, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <span className="font-medium text-gray-200">{fow.playerName}</span>
                <span className="text-2xs text-gray-400">
                  {fow.runs} runs • {fow.overs}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
