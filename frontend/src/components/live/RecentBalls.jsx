export function RecentBalls({ balls }) {
  const getBallBadge = (ball) => {
    if (typeof ball === "string") {
      if (ball === "W") return { bg: "bg-red-500/30 border-red-500/50", text: "text-red-300 font-bold", label: "W" };
      if (ball === "WD") return { bg: "bg-amber-500/20 border-amber-500/30", text: "text-amber-300 font-bold", label: "WD" };
      if (ball === "NB") return { bg: "bg-blue-500/20 border-blue-500/30", text: "text-blue-300 font-bold", label: "NB" };
    } else if (typeof ball === "number") {
      if (ball === 0) return { bg: "bg-gray-600/20 border-gray-600/40", text: "text-gray-400 font-semibold", label: "•" };
      if (ball === 4) return { bg: "bg-ipl-orange/30 border-ipl-orange/50", text: "text-ipl-orange font-bold", label: "4" };
      if (ball === 6) return { bg: "bg-yellow-500/30 border-yellow-500/50", text: "text-yellow-300 font-bold", label: "6" };
      return { bg: "bg-ipl-cyan/20 border-ipl-cyan/40", text: "text-ipl-cyan font-semibold", label: ball };
    }
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="text-sm font-semibold text-gray-300">Recent Balls</div>

      <div className="flex flex-wrap gap-2">
        {balls.map((ball, idx) => {
          const badge = getBallBadge(ball);
          return (
            <div
              key={idx}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition ${badge.bg} hover:scale-110 cursor-pointer`}
              title={typeof ball === "number" ? `${ball} runs` : ball}
            >
              <span className={badge.text}>{badge.label}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-2xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-ipl-orange/30 border border-ipl-orange/50" />
          <span className="text-gray-400">4 = Four</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/30 border border-yellow-500/50" />
          <span className="text-gray-400">6 = Six</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500/50" />
          <span className="text-gray-400">W = Wicket</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-600/20 border border-gray-600/40" />
          <span className="text-gray-400">• = Dot</span>
        </div>
      </div>
    </div>
  );
}
