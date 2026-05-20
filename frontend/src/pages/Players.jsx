import { useEffect, useState } from "react";

function Players() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/players")
      .then((res) => res.json())
      .then((data) => setPlayers(data));
  }, []);

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8">
        <h1 className="text-5xl font-bold">Players</h1>
        <p className="text-gray-100 mt-2">
          Search IPL players and stats.
        </p>
      </div>

      <input
        type="text"
        placeholder="Search player..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white outline-none"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlayers.map((player, index) => (
          <div
            key={index}
            className="bg-zinc-900 border border-gray-800 rounded-3xl p-6 hover:border-orange-500 transition"
          >
            <h2 className="text-3xl font-bold">{player.name}</h2>

            <p className="text-gray-400">
              {player.team} • {player.role}
            </p>

            <p className="text-orange-500 text-2xl font-bold mt-4">
              {player.stat}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Players;