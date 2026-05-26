import { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, TrendCard } from "../components/charts/AnalyticsCharts";
import PlayerSearch from "../components/PlayerSearch";
import { getMatchup } from "../services/playerSearchService";

const VENUES = ["", "Wankhede", "Eden Gardens", "MCA Stadium", "Arun Jaitley"];
const SEASONS = ["", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"];
const PHASES = ["", "Powerplay", "Middle", "Death"];

export default function BatterVsBowler() {
  const [batter, setBatter] = useState(null);
  const [bowler, setBowler] = useState(null);
  const [venue, setVenue] = useState("");
  const [season, setSeason] = useState("");
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canAnalyze = batter && bowler;

  const analyze = async () => {
    if (!canAnalyze) {
      setError("Please select both batter and bowler.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getMatchup(batter, bowler, venue, season, phase);
      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to analyze matchup.");
    } finally {
      setLoading(false);
    }
  };

  const stats = result
    ? {
        runs: Number(result.runs || 0),
        balls: Number(result.balls || 0) || 1,
        sr: Number(result.strikeRate || 0),
        boundaryPct: Number(result.boundaryPct || 0),
        dotPct: Number(result.dotBallPct || 0),
        dismissals: Number(result.dismissals || 0),
        insight: result.insight || "",
        recentTrend: result.recentTrend || [0, 0, 0],
        riskRating: result.riskRating || "—",
      }
    : null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl p-6 card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ipl-cyan/80">Batter vs Bowler</p>
            <h1 className="text-3xl font-semibold text-white">In-depth clash analysis</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Search any batter and bowler by name, then drill into venue, season and phase analytics.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <PlayerSearch
              placeholder="Search batter e.g. Kohli"
              role="batter"
              onSelect={setBatter}
              className="w-full"
            />
            <PlayerSearch
              placeholder="Search bowler e.g. Bumrah"
              role="bowler"
              onSelect={setBowler}
              className="w-full"
            />
            <select value={venue} onChange={(e) => setVenue(e.target.value)} className="input-field">
              {VENUES.map((item) => (
                <option key={item} value={item}>{item || "All venues"}</option>
              ))}
            </select>
            <select value={season} onChange={(e) => setSeason(e.target.value)} className="input-field">
              {SEASONS.map((item) => (
                <option key={item} value={item}>{item || "All seasons"}</option>
              ))}
            </select>
            <select value={phase} onChange={(e) => setPhase(e.target.value)} className="input-field">
              {PHASES.map((item) => (
                <option key={item} value={item}>{item || "All phases"}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button disabled={!canAnalyze || loading} onClick={analyze} className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Analyzing…" : "Analyze matchup"}
          </button>
          <span className="text-sm text-gray-400">Search local players first, then fallback to cached API results.</span>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {result.requiresBallByBallData ? (
            <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-6 text-sm text-gray-300">
              <p className="font-semibold text-white mb-2">Detailed matchup requires ball-by-ball IPL deliveries dataset.</p>
              <p>
                Search works, but matchup depth is only available with local historical ball-by-ball data. The selected players are {batter?.name || "unknown"} and {bowler?.name || "unknown"}.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <TrendCard title="Runs" value={stats.runs} description="Runs scored by the batter against the bowler." />
                <TrendCard title="Strike Rate" value={stats.sr} description="Aggression in this matchup." />
                <TrendCard title="Risk rating" value={stats.riskRating} description="How aggressive the matchup has been." />
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <TrendCard title="Boundary %" value={`${stats.boundaryPct}%`} description="Scoring density from boundaries." />
                <TrendCard title="Dot ball %" value={`${stats.dotPct}%`} description="Bowler pressure in the matchup." />
                <TrendCard title="Dismissals" value={stats.dismissals} description="Times dismissed in the matchups." />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Matchup insight</p>
                  <p className="mt-4 text-sm text-gray-300">{stats.insight}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Recent trend</p>
                  <LineChart title="Recent strike rate" data={stats.recentTrend} subtitle="Latest sample of the matchup" color="#e85d26" />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-white">Matchup context</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-gray-400">Matchup scale</p>
                    <p className="mt-2 text-xl font-semibold text-white">{stats.runs} runs</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-gray-400">Balls faced</p>
                    <p className="mt-2 text-xl font-semibold text-white">{stats.balls}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-gray-400">Phase</p>
                    <p className="mt-2 text-xl font-semibold text-white">{phase || "All phases"}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
