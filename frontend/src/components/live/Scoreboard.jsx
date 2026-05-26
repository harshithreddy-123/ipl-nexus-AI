export function Scoreboard({ innings, currentInnings }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* First Innings */}
      <div className="card p-5 space-y-3">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{innings[0].team} - 1st Innings</div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="text-4xl font-bold text-white">{innings[0].score}</div>
            <div className="text-lg font-semibold text-gray-400">/{innings[0].wickets}</div>
          </div>
          <div className="text-xs text-gray-500">
            <span>{innings[0].overs} overs</span>
            <span className="mx-2">•</span>
            <span className="text-ipl-orange font-medium">RR: {innings[0].runRate}</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="text-2xs text-gray-400">Extras</div>
            <div className="text-lg font-semibold">{innings[0].extras}</div>
          </div>
          <div>
            <div className="text-2xs text-gray-400">Top Scorer</div>
            <div className="text-sm font-semibold truncate">{innings[0].batsmen[0].name}</div>
          </div>
        </div>
      </div>

      {/* Current Innings */}
      <div className="card p-5 space-y-3 border-ipl-orange/30 relative">
        <div className="absolute -top-2 -right-2 bg-red-500/90 text-white text-2xs font-bold px-2 py-1 rounded-full">LIVE</div>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{currentInnings.team} - 2nd Innings</div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="text-4xl font-bold text-ipl-cyan">{currentInnings.score}</div>
            <div className="text-lg font-semibold text-gray-400">/{currentInnings.wickets}</div>
          </div>
          <div className="text-xs text-gray-500">
            <span>{currentInnings.overs} overs</span>
            <span className="mx-2">•</span>
            <span className="text-ipl-orange font-medium">CRR: {currentInnings.runRate}</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Target</span>
            <span className="font-bold text-ipl-gold">{currentInnings.target}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Req. RR</span>
            <span className="font-bold text-ipl-orange">{currentInnings.requiredRunRate}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Runs Needed</span>
            <span className="font-bold text-ipl-cyan">{currentInnings.target - currentInnings.score}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
