export function Commentary({ commentary = [] }) {
  const getCommentaryColor = (type) => {
    switch (type) {
      case "four":
        return "border-ipl-orange/40 bg-ipl-orange/5";
      case "six":
        return "border-yellow-500/40 bg-yellow-500/5";
      case "wicket":
        return "border-red-500/40 bg-red-500/5";
      case "run":
        return "border-ipl-cyan/40 bg-ipl-cyan/5";
      default:
        return "border-white/10 bg-white/5";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "four":
        return "4";
      case "six":
        return "6";
      case "wicket":
        return "W";
      case "run":
        return "↻";
      default:
        return "•";
    }
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="text-sm font-semibold text-gray-300">Ball-by-Ball Commentary</div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {commentary.map((item, idx) => (
          <div key={idx} className={`p-3 rounded-xl border ${getCommentaryColor(item.type)} transition hover:bg-white/10`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-ipl-orange to-ipl-cyan flex items-center justify-center">
                  <span className="text-2xs font-bold text-white">{getTypeIcon(item.type)}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-2xs text-gray-400 mb-0.5">
                  <span className="font-semibold text-gray-300">{item.over}.{item.ball}</span>
                  <span className="mx-1">•</span>
                  <span>{item.batter} vs {item.bowler}</span>
                </div>
                <p className="text-sm text-gray-100">{item.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
