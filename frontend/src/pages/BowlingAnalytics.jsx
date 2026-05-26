import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendCard } from "../components/charts/AnalyticsCharts";
import PlayerSearch from "../components/PlayerSearch";
import { getBowlerProfile } from "../services/playerSearchService";

const VENUES = ["", "Wankhede", "Eden Gardens", "MCA Stadium", "Arun Jaitley"];
const SEASONS = ["", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"];

export default function BowlingAnalytics() {
  const [selectedBowler, setSelectedBowler] = useState(null);
  const [venue, setVenue] = useState("");
  const [season, setSeason] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedBowler) {
      setProfile(null);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    getBowlerProfile(selectedBowler, venue, season)
      .then((result) => {
        if (active) setProfile(result);
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load bowler analytics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedBowler, venue, season]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl p-6 card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ipl-cyan/80">Bowling Analytics</p>
            <h1 className="text-3xl font-semibold text-white">Bowler performance intelligence</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Search any bowler name and review local-first analytics across venues and seasons.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <PlayerSearch
              placeholder="Search bowler e.g. Bumrah"
              role="bowler"
              onSelect={setSelectedBowler}
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
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="grid gap-4 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      {profile && !loading && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-400">Selected bowler</p>
                <h2 className="text-2xl font-semibold text-white">{profile.name}</h2>
                <p className="text-sm text-gray-400">{profile.role} • {profile.team || "Unknown team"}</p>
              </div>
              <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-gray-200">{profile.message}</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TrendCard title="Wickets" value={profile.overall.dismissals || 0} description="Total wickets taken." />
            <TrendCard title="Runs Conceded" value={profile.overall.runs || 0} description="Total runs conceded." />
            <TrendCard title="Economy" value={profile.overall.strike_rate?.toFixed(2) || "0.00"} description="Runs per delivery." />
            <TrendCard title="Average" value={profile.overall.average?.toFixed(2) || "0.00"} description="Runs per wicket." />
          </div>

          {profile.strengths && profile.strengths.length > 0 && (
            <div className="rounded-3xl border border-green-900/30 bg-green-950/20 p-6">
              <h3 className="text-lg font-bold text-green-400 mb-3">✓ Strengths</h3>
              <ul className="space-y-2">
                {profile.strengths.map((strength, idx) => (
                  <li key={idx} className="text-gray-200 text-sm">• {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {profile.weaknesses && profile.weaknesses.length > 0 && (
            <div className="rounded-3xl border border-red-900/30 bg-red-950/20 p-6">
              <h3 className="text-lg font-bold text-red-400 mb-3">⚠ Weaknesses</h3>
              <ul className="space-y-2">
                {profile.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="text-gray-200 text-sm">• {weakness}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Performance vs Spin</p>
              <div className="mt-4 space-y-3">
                <p className="text-3xl font-semibold text-ipl-gold">{profile.vsSpin?.runs || 0}</p>
                <p className="text-sm text-gray-400">Strike Rate: {profile.vsSpin?.strike_rate?.toFixed(2)} | Avg: {profile.vsSpin?.average?.toFixed(2)}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Performance vs Pace</p>
              <div className="mt-4 space-y-3">
                <p className="text-3xl font-semibold text-cyan-400">{profile.vsPace?.runs || 0}</p>
                <p className="text-sm text-gray-400">Strike Rate: {profile.vsPace?.strike_rate?.toFixed(2)} | Avg: {profile.vsPace?.average?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {profile.seasons && profile.seasons.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-4">Season Performance</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {profile.seasons.map((season, idx) => (
                  <div key={idx} className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-gray-400">Season {season.season}</p>
                    <p className="text-2xl font-bold text-orange-500 mt-2">{season.runs} runs</p>
                    <p className="text-xs text-gray-500 mt-1">SR: {season.strike_rate?.toFixed(2)} | Avg: {season.average?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
