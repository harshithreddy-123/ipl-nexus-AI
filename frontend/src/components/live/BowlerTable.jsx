export function BowlerTable({ bowlers }) {
  const currentBowler = bowlers.find((b) => b.isCurrent);

  return (
    <div className="card p-4 space-y-3">
      <div className="text-sm font-semibold text-gray-300">Bowler - Current Over</div>

      {/* Current Bowler Highlight */}
      <div className="bg-black/50 rounded-2xl p-4 border border-ipl-orange/20 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-white">{currentBowler?.name}</div>
            <div className="text-2xs text-gray-400">Current Bowler</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-ipl-orange">{currentBowler?.wickets || 0}</div>
            <div className="text-2xs text-gray-400">Wickets</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-2xs text-gray-400">Overs</div>
            <div className="text-base font-bold text-white">{currentBowler?.overs.toFixed(1)}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-2xs text-gray-400">Runs</div>
            <div className="text-base font-bold text-ipl-cyan">{currentBowler?.runs || 0}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-2xs text-gray-400">Economy</div>
            <div className="text-base font-bold text-ipl-orange">{currentBowler?.economy.toFixed(2)}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-2xs text-gray-400">Maidens</div>
            <div className="text-base font-bold text-white">{currentBowler?.maidens || 0}</div>
          </div>
        </div>
      </div>

      {/* Other Bowlers */}
      <div className="space-y-2">
        <div className="text-2xs text-gray-400 px-1">Bowling Stats</div>
        {bowlers
          .filter((b) => !b.isCurrent)
          .slice(0, 3)
          .map((bowler, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-sm">
              <span className="font-medium text-gray-200">{bowler.name}</span>
              <div className="flex items-center gap-3 text-2xs">
                <span className="text-gray-400">{bowler.overs.toFixed(1)} ov</span>
                <span className="text-ipl-cyan font-semibold w-6 text-right">{bowler.runs}</span>
                <span className="text-ipl-orange font-semibold w-5 text-right">{bowler.wickets}w</span>
                <span className="text-gray-400 w-8 text-right">{bowler.economy.toFixed(1)}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
