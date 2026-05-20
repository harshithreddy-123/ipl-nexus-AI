import { useEffect, useState } from "react";

function Analytics() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/analytics")
      .then((res) => res.json())
      .then((data) => setCards(data))
      .catch(() => setCards([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-8">
        <h1 className="text-5xl font-bold">IPL Analytics</h1>
        <p className="text-gray-100 mt-2">
          Backend-powered insights and performance analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-zinc-900 border border-gray-800 rounded-3xl p-6 hover:scale-105 hover:border-orange-500 transition duration-300"
          >
            <p className="text-gray-400">{card.title}</p>

            <h2 className="text-2xl font-bold text-orange-500 mt-2">
              {card.value}
            </h2>

            <p className="text-gray-500 mt-2">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Analytics;