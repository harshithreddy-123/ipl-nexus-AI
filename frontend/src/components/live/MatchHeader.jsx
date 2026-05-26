import { FiMapPin, FiAlertCircle } from "react-icons/fi";

export function MatchHeader({ match }) {
  return (
    <div className="card p-6 space-y-4">
      {/* Live Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-red-400">LIVE</span>
        </div>
        <span className="text-2xs text-gray-400">{match.league}</span>
      </div>

      {/* Teams and Score */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{match.teamBowling.shortName}</div>
          <div className="text-2xs text-gray-400 mt-1">Bowled</div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="text-xs text-gray-400">Match {match.matchNumber}</div>
          <div className="text-lg font-semibold text-gray-300 mt-1">vs</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold">{match.teamBatting.shortName}</div>
          <div className="text-2xs text-gray-400 mt-1">Batting</div>
        </div>
      </div>

      {/* Status Text */}
      <div className="border-t border-white/10 pt-3">
        <p className="text-sm text-ipl-cyan font-medium">{match.statusText}</p>
      </div>

      {/* Venue and Toss */}
      <div className="grid grid-cols-2 gap-3 text-2xs">
        <div className="flex items-start gap-2">
          <FiMapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-gray-400">Venue</div>
            <div className="text-gray-200 font-medium">{match.venue}</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <FiAlertCircle className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-gray-400">Toss</div>
            <div className="text-gray-200 font-medium">{match.toss.replace("elected to bat", "bat")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
