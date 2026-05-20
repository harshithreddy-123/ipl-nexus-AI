import { useEffect, useState } from "react";

function Standings() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/standings")
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch(() => setTeams([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-emerald-700 rounded-3xl p-8">
        <h1 className="text-5xl font-bold">IPL Points Table</h1>
        <p className="text-gray-100 mt-2">Backend-powered team standings and NRR.</p>
      </div>

      <div className="bg-zinc-900 border border-gray-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-800 text-gray-300">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Team</th>
              <th className="p-4">P</th>
              <th className="p-4">W</th>
              <th className="p-4">L</th>
              <th className="p-4">NRR</th>
              <th className="p-4">Pts</th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team) => (
              <tr key={team.rank} className="border-t border-gray-800 hover:bg-zinc-800">
                <td className="p-4 text-orange-500 font-bold">{team.rank}</td>
                <td className="p-4 font-bold">{team.team}</td>
                <td className="p-4">{team.played}</td>
                <td className="p-4 text-green-400">{team.won}</td>
                <td className="p-4 text-red-400">{team.lost}</td>
                <td className="p-4">{team.nrr}</td>
                <td className="p-4 font-bold text-orange-500">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Standings;