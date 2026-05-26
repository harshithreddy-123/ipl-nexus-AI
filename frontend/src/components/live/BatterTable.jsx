export function BatterTable({ batsmen, lastWicket }) {
  const striker = batsmen.find((b) => b.isStriker);
  const nonStriker = batsmen.find((b) => !b.isStriker && !b.out);

  return (
    <div className="card p-4 space-y-4">
      <div className="text-sm font-semibold text-gray-300">Current Partnership</div>

      {/* Striker */}
      <div className="bg-black/40 rounded-2xl p-3 border border-ipl-cyan/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-ipl-cyan/20 flex items-center justify-center">
              <span className="text-xs font-bold text-ipl-cyan">*</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white">{striker?.name}</div>
              <div className="text-2xs text-gray-400">Striker</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-ipl-cyan">{striker?.runs || 0}</div>
            <div className="text-2xs text-gray-400">({striker?.balls || 0}b)</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-2xs">
          <div className="bg-white/5 rounded p-2 text-center">
            <div className="text-gray-400">4s</div>
            <div className="font-bold text-white">{striker?.fours || 0}</div>
          </div>
          <div className="bg-white/5 rounded p-2 text-center">
            <div className="text-gray-400">6s</div>
            <div className="font-bold text-white">{striker?.sixes || 0}</div>
          </div>
          <div className="bg-white/5 rounded p-2 text-center">
            <div className="text-gray-400">SR</div>
            <div className="font-bold text-ipl-orange">{striker?.strikeRate.toFixed(1)}</div>
          </div>
          <div className="bg-white/5 rounded p-2 text-center">
            <div className="text-gray-400">Dots</div>
            <div className="font-bold text-white">{striker?.balls ? Math.floor(striker.balls * 0.3) : 0}</div>
          </div>
        </div>
      </div>

      {/* Non-Striker */}
      <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-400">○</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-200">{nonStriker?.name}</div>
              <div className="text-2xs text-gray-400">Non-striker</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-200">{nonStriker?.runs || 0}</div>
            <div className="text-2xs text-gray-400">({nonStriker?.balls || 0}b)</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-2xs">
          <div className="bg-white/5 rounded p-2 text-center">
            <div className="text-gray-400">4s</div>
            <div className="font-bold text-white">{nonStriker?.fours || 0}</div>
          </div>
          <div className="bg-white/5 rounded p-2 text-center">
            <div className="text-gray-400">6s</div>
            <div className="font-bold text-white">{nonStriker?.sixes || 0}</div>
          </div>
          <div className="bg-white/5 rounded p-2 text-center">
            <div className="text-gray-400">SR</div>
            <div className="font-bold text-ipl-orange">{nonStriker?.strikeRate.toFixed(1)}</div>
          </div>
          <div className="bg-white/5 rounded p-2 text-center">
            <div className="text-gray-400">Dots</div>
            <div className="font-bold text-white">{nonStriker?.balls ? Math.floor(nonStriker.balls * 0.3) : 0}</div>
          </div>
        </div>
      </div>

      {/* Recent Wicket */}
      {lastWicket && (
        <div className="pt-2 border-t border-white/10">
          <div className="text-2xs text-gray-400 mb-2">Last Wicket</div>
          <div className="text-sm">
            <span className="font-semibold text-white">{lastWicket.playerName}</span>
            <span className="text-gray-400 ml-2">{lastWicket.dismissal}</span>
            <span className="text-2xs text-gray-500 ml-2">({lastWicket.overs})</span>
          </div>
        </div>
      )}
    </div>
  );
}
