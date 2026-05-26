import { useEffect, useState } from "react";
import { searchPlayers } from "../services/playerSearchService";

function Players() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    searchPlayers(search, "player")
      .then((data) => {
        if (!active) return;
        setPlayers(data.players || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Unable to load players.");
        setPlayers([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search]);

  const handlePlayerClick = async (player) => {
    try {
      const response = await fetch(`/api/player-profile?playerId=${encodeURIComponent(player.name)}`);
      if (response.ok) {
        const profile = await response.json();
        setSelectedPlayer({ ...player, ...profile });
      } else {
        setSelectedPlayer(player);
      }
    } catch {
      setSelectedPlayer(player);
    }
  };

  if (selectedPlayer) {
    const overall = selectedPlayer.overall || {};
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedPlayer(null)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-white transition"
          >
            Back
          </button>
          <h1 className="text-4xl font-bold">{selectedPlayer.name}</h1>
          <div className="text-right">
            <p className="text-gray-400 text-sm">{selectedPlayer.team || "Unknown"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase">Runs</p>
            <p className="text-3xl font-bold text-orange-500">{overall.runs || 0}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase">Balls</p>
            <p className="text-3xl font-bold text-blue-400">{overall.balls || 0}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase">Strike Rate</p>
            <p className="text-3xl font-bold text-green-400">{overall.strike_rate?.toFixed(2) || "0.00"}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase">Average</p>
            <p className="text-3xl font-bold text-purple-400">{overall.average?.toFixed(2) || "0.00"}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase">Fours</p>
            <p className="text-3xl font-bold">{overall.fours || 0}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase">Sixes</p>
            <p className="text-3xl font-bold text-red-500">{overall.sixes || 0}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase">Dot %</p>
            <p className="text-3xl font-bold">{overall.dot_pct?.toFixed(1) || "0.0"}%</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase">Boundary %</p>
            <p className="text-3xl font-bold">{overall.boundary_pct?.toFixed(1) || "0.0"}%</p>
          </div>
        </div>

        {selectedPlayer.seasons && selectedPlayer.seasons.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Seasons</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedPlayer.seasons.map((season, idx) => (
                <div key={idx} className="bg-zinc-800 rounded-xl p-3">
                  <p className="text-gray-400 text-sm">Season {season.season}</p>
                  <p className="text-2xl font-bold text-orange-500">{season.runs} runs</p>
                  <p className="text-xs text-gray-500">SR: {season.strike_rate?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPlayer.strengths && selectedPlayer.strengths.length > 0 && (
          <div className="bg-green-950/30 rounded-2xl p-6 border border-green-900">
            <h3 className="text-lg font-bold text-green-400 mb-3">Strengths</h3>
            <ul className="space-y-2">
              {selectedPlayer.strengths.map((strength, idx) => (
                <li key={idx} className="text-gray-200">• {strength}</li>
              ))}
            </ul>
          </div>
        )}

        {selectedPlayer.weaknesses && selectedPlayer.weaknesses.length > 0 && (
          <div className="bg-red-950/30 rounded-2xl p-6 border border-red-900">
            <h3 className="text-lg font-bold text-red-400 mb-3">Weaknesses</h3>
            <ul className="space-y-2">
              {selectedPlayer.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-gray-200">• {weakness}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8">
        <h1 className="text-5xl font-bold">Players</h1>
        <p className="text-gray-100 mt-2">
          Search IPL players and stats.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr] items-center">
        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white outline-none"
        />
        <div className="text-right text-sm text-gray-400">
          {loading ? "Searching players…" : error ? error : `${players.length} player${players.length === 1 ? "" : "s"} found`}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {players.map((player, index) => (
          <button
            key={`${player.id || player.name}-${index}`}
            onClick={() => handlePlayerClick(player)}
            className="bg-zinc-900 border border-gray-800 rounded-3xl p-6 hover:border-orange-500 transition text-left"
          >
            <h2 className="text-3xl font-bold">{player.name}</h2>
            <p className="text-gray-400">{player.team || "Unknown team"} • {player.role || "Player"}</p>
            <p className="text-xs text-gray-500 mt-2">Click to view details</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Players;
