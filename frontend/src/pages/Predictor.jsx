import { useEffect, useState } from "react";

function Predictor() {
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/prediction")
      .then((res) => res.json())
      .then((data) => setPrediction(data))
      .catch(() => setPrediction(null));
  }, []);

  if (!prediction) {
    return <p className="text-orange-400">Loading prediction...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl p-8">
        <h1 className="text-5xl font-bold">Match Predictor</h1>
        <p className="text-gray-100 mt-2">
          Backend-powered AI-style prediction.
        </p>
      </div>

      <div className="bg-zinc-900 border border-gray-800 rounded-3xl p-8 hover:border-orange-500 transition duration-300">
        <h2 className="text-3xl font-bold mb-6">
          {prediction.match}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-800 rounded-2xl p-6 hover:scale-105 transition duration-300">
            <p className="text-gray-400">
              {prediction.team1} Winning Chance
            </p>

            <h1 className="text-5xl font-bold text-green-400 mt-2">
              {prediction.team1_chance}%
            </h1>
          </div>

          <div className="bg-zinc-800 rounded-2xl p-6 hover:scale-105 transition duration-300">
            <p className="text-gray-400">
              {prediction.team2} Winning Chance
            </p>

            <h1 className="text-5xl font-bold text-red-400 mt-2">
              {prediction.team2_chance}%
            </h1>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-zinc-800 rounded-full h-5 overflow-hidden">
            <div
              className="bg-green-500 h-full"
              style={{ width: `${prediction.team1_chance}%` }}
            ></div>
          </div>

          <div className="bg-zinc-800 rounded-full h-5 overflow-hidden mt-4">
            <div
              className="bg-red-500 h-full"
              style={{ width: `${prediction.team2_chance}%` }}
            ></div>
          </div>
        </div>

        <p className="text-gray-300 mt-6">
          {prediction.reason}
        </p>
      </div>
    </div>
  );
}

export default Predictor;