import { useEffect, useState } from "react";

function Teams() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch(() => setTeams([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-600 to-purple-700 rounded-3xl p-8">
        <h1 className="text-5xl font-bold">IPL Teams</h1>
        <p className="text-gray-100 mt-2">
          Backend-powered IPL franchises.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
        {teams.map((team) => (
          <div
            key={team.short}
            className="bg-zinc-900 border border-gray-800 rounded-3xl p-8 text-center hover:scale-105 hover:border-orange-500 transition duration-300"
          >
            <h2 className="text-4xl font-bold text-orange-500">
              {team.short}
            </h2>

            <p className="text-gray-400 mt-2">
              {team.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Teams;