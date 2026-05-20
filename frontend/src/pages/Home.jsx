import { useEffect, useState } from "react";

function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(() => setData(null));
  }, []);

  const fallback = {
    live_matches: 4,
    players: "250+",
    teams: 10,
    predictions: "AI",
    featured_match: {
      match: "CSK vs RCB",
      score: "186/4",
      overs: "17.2",
      status: "Live",
    },
  };

  const dashboard = data || fallback;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-10">
        <h1 className="text-5xl font-bold mb-4">IPL Nexus AI</h1>
        <p className="text-xl text-gray-100">
          Full-stack cricket analytics platform powered by React, FastAPI and AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 p-6 rounded-3xl border border-gray-800">
          <p className="text-gray-400">Live Matches</p>
          <h1 className="text-5xl font-bold text-orange-500 mt-3">{dashboard.live_matches}</h1>
        </div>

        <div className="bg-zinc-900 p-6 rounded-3xl border border-gray-800">
          <p className="text-gray-400">Players</p>
          <h1 className="text-5xl font-bold text-blue-400 mt-3">{dashboard.players}</h1>
        </div>

        <div className="bg-zinc-900 p-6 rounded-3xl border border-gray-800">
          <p className="text-gray-400">Teams</p>
          <h1 className="text-5xl font-bold text-green-400 mt-3">{dashboard.teams}</h1>
        </div>

        <div className="bg-zinc-900 p-6 rounded-3xl border border-gray-800">
          <p className="text-gray-400">Predictions</p>
          <h1 className="text-5xl font-bold text-pink-400 mt-3">{dashboard.predictions}</h1>
        </div>
      </div>

      <div className="bg-zinc-900 border border-gray-800 rounded-3xl p-8">
        <h2 className="text-3xl font-bold mb-4">Featured Match</h2>

        <div className="flex justify-between flex-wrap gap-6">
          <div>
            <h3 className="text-2xl font-bold">{dashboard.featured_match.match}</h3>
            <p className="text-gray-400">IPL 2026 • {dashboard.featured_match.status}</p>
          </div>

          <div className="text-right">
            <p className="text-4xl font-bold text-orange-500">{dashboard.featured_match.score}</p>
            <p className="text-gray-400">{dashboard.featured_match.overs} Overs</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;