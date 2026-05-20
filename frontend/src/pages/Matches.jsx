import { useEffect, useState } from "react";

function Matches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/matches")
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch(() => setMatches([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8">
        <h1 className="text-5xl font-bold">IPL Matches</h1>
        <p className="text-gray-100 mt-2">Backend-powered match cards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match, index) => (
          <div
            key={index}
            className="bg-zinc-900 border border-gray-800 rounded-3xl p-6 hover:scale-105 hover:border-orange-500 transition duration-300"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">
                {match.team1} vs {match.team2}
              </h2>

              <span className="bg-red-500 px-4 py-2 rounded-full text-sm">
                {match.status}
              </span>
            </div>

            <p className="text-4xl text-orange-500 font-bold mt-6">
              {match.score}
            </p>

            <p className="text-gray-400">{match.overs} Overs</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Matches;