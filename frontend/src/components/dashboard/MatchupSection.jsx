import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

function Metric({ label, value, light }) {
  return (
    <div className={light ? "card-light p-3 text-center" : "card p-3 text-center"}>
      <p className="text-2xs text-gray-500">{label}</p>
      <p className="text-base font-bold text-ipl-gold mt-0.5">{value}</p>
    </div>
  );
}

export default function MatchupSection({
  batters,
  bowlers,
  fetchMatchup,
  globalSearch,
  light,
}) {
  const [batterSearch, setBatterSearch] = useState("");
  const [bowlerSearch, setBowlerSearch] = useState("");
  const [batter, setBatter] = useState("");
  const [bowler, setBowler] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizePlayer = (player) => {
    if (typeof player === "object" && player !== null) {
      return {
        id: player.id ?? player.name ?? String(player),
        name: player.name ?? String(player),
      };
    }
    return { id: String(player), name: String(player) };
  };

  const filterList = (list, q, global) => {
    const term = (q || global || "").trim().toLowerCase();
    const normalized = list.map(normalizePlayer);
    if (!term) return normalized.slice(0, 80);
    return normalized.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 80);
  };

  const batterOptions = useMemo(
    () => filterList(batters, batterSearch, globalSearch),
    [batters, batterSearch, globalSearch],
  );
  const bowlerOptions = useMemo(
    () => filterList(bowlers, bowlerSearch, globalSearch),
    [bowlers, bowlerSearch, globalSearch],
  );

  useEffect(() => {
    if (!batter || !bowler) {
      setStats(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMatchup(batter, bowler)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setStats({ found: false });
          setError(err?.message || "Unable to load matchup.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [batter, bowler, fetchMatchup]);

  return (
    <section id="matchup" className="scroll-mt-16">
      <div className="flex items-center justify-between mb-3">
        <h2 className={light ? "section-title-light" : "section-title"}>Batter vs bowler</h2>
        <span className="text-2xs text-ipl-cyan">Primary feature</span>
      </div>

      <div className={light ? "card-light p-4" : "card p-4"}>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-2xs text-gray-500 block mb-1">Search batter</label>
            <input
              className={light ? "input-field-light mb-2" : "input-field mb-2"}
              placeholder="e.g. Kohli"
              value={batterSearch}
              onChange={(e) => setBatterSearch(e.target.value)}
            />
            <select
              className={light ? "input-field-light" : "input-field"}
              value={batter}
              onChange={(e) => setBatter(e.target.value)}
            >
              <option value="">Select batter</option>
              {batterOptions.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-2xs text-gray-500 block mb-1">Search bowler</label>
            <input
              className={light ? "input-field-light mb-2" : "input-field mb-2"}
              placeholder="e.g. Bumrah"
              value={bowlerSearch}
              onChange={(e) => setBowlerSearch(e.target.value)}
            />
            <select
              className={light ? "input-field-light" : "input-field"}
              value={bowler}
              onChange={(e) => setBowler(e.target.value)}
            >
              <option value="">Select bowler</option>
              {bowlerOptions.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <p className="text-xs text-gray-500 animate-pulse">Calculating matchup…</p>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && stats && !stats.found && (
          <p className="text-xs text-gray-500">No balls found for this pair in the dataset.</p>
        )}

        {!loading && stats?.found && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-xs text-gray-400">
              <span className="text-ipl-cyan font-medium">{stats.batter}</span>
              {" vs "}
              <span className="text-ipl-orange font-medium">{stats.bowler}</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              <Metric label="Runs" value={stats.runs} light={light} />
              <Metric label="Balls" value={stats.balls} light={light} />
              <Metric label="4s" value={stats.fours} light={light} />
              <Metric label="6s" value={stats.sixes} light={light} />
              <Metric label="Strike rate" value={stats.strike_rate} light={light} />
              <Metric label="Dot %" value={`${stats.dot_pct}%`} light={light} />
              <Metric label="Wickets" value={stats.wickets} light={light} />
            </div>
          </motion.div>
        )}

        {!batter && !bowler && (
          <p className="text-xs text-gray-500">Pick a batter and bowler to see head-to-head stats.</p>
        )}
      </div>
    </section>
  );
}
