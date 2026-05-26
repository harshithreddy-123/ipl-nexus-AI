import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, TrendCard } from "../components/charts/AnalyticsCharts";
import PlayerSearch from "../components/PlayerSearch";
import { getPlayerProfile } from "../services/playerSearchService";

const SEASONS = ["", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016"];
const VENUES = ["", "Wankhede", "Eden Gardens", "MCA Stadium", "Arun Jaitley"];

export default function PlayerStats() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [venue, setVenue] = useState("");
  const [season, setSeason] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedPlayer) {
      setProfile(null);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    getPlayerProfile(selectedPlayer, venue, season)
      .then((result) => {
        if (active) setProfile(result);
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load analytics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedPlayer, venue, season]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl p-6 card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ipl-cyan/80">Player Analytics</p>
            <h1 className="text-3xl font-semibold text-white">Search any IPL player</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Type a player name and access local analytics, cached results, or CricketData fallback data.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PlayerSearch
              placeholder="Search player e.g. Kohli, Bumrah, Dhoni"
              role="player"
              onSelect={setSelectedPlayer}
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

      {!selectedPlayer && (
        <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-6 text-sm text-gray-300">
          Start typing a player name to load analytics. The search uses local data first, then cached API results, then CricketData.
        </div>
      )}

      {loading && (
        <div className="grid gap-4 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-3xl bg-white/5" />
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
                <p className="text-sm text-gray-400">Selected player</p>
                <h2 className="text-2xl font-semibold text-white">{profile.name}</h2>
                <p className="text-sm text-gray-400">{profile.role} • {profile.team || "Unknown team"}</p>
              </div>
              <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-gray-200">{profile.message}</div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            <TrendCard title="Runs" value={profile.overall.runs} description="Total runs in the available dataset." />
            <TrendCard title="Strike rate" value={profile.overall.strikeRate} description="Runs scored per 100 balls." />
            <TrendCard title="Average" value={profile.overall.average} description="Runs per dismissal." />
            <TrendCard title="Boundary %" value={`${profile.overall.boundaryPct}%`} description="Share of runs from fours and sixes." />
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            <TrendCard title="Dot ball %" value={`${profile.overall.dotBallPct}%`} description="Percentage of scoreless deliveries." />
            <TrendCard title="Balls faced" value={profile.overall.ballsFaced} description="Sample size of deliveries faced." />
            <TrendCard title="Dismissals" value={profile.overall.dismissals} description="Times dismissed." />
            <TrendCard title="Data source" value={profile.source} description="Where the analytics originated." />
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

          {profile.hasBallByBallData ? (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                <LineChart
                  title="Season-wise runs"
                  data={profile.seasons.map((item) => item.runs)}
                  subtitle="Runs by season"
                  color="#d4a72c"
                />
                <LineChart
                  title="Season-wise strike rate"
                  data={profile.seasons.map((item) => item.strikeRate)}
                  subtitle="Strike rate by season"
                  color="#22b8d9"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Performance vs spin</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{profile.vsSpin.runs}</p>
                  <p className="text-sm text-gray-400">SR {profile.vsSpin.strikeRate} · Avg {profile.vsSpin.average}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Performance vs pace</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{profile.vsPace.runs}</p>
                  <p className="text-sm text-gray-400">SR {profile.vsPace.strikeRate} · Avg {profile.vsPace.average}</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Venue performance</p>
                  <div className="mt-4 space-y-3">
                    {profile.venueStats.map((item) => (
                      <div key={item.venue} className="rounded-2xl bg-white/5 p-3">
                        <p className="font-medium text-white">{item.venue}</p>
                        <p className="text-sm text-gray-400">{item.runs} runs · SR {item.strikeRate}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Phase breakdown</p>
                  <div className="mt-4 space-y-3">
                    {Object.entries(profile.phasePerformance).map(([phase, stats]) => (
                      <div key={phase} className="rounded-2xl bg-white/5 p-3">
                        <p className="font-medium text-white">{phase}</p>
                        <p className="text-sm text-gray-400">{stats.runs} runs · SR {stats.strikeRate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-white">Bowler matchup intelligence</h2>
                <div className="mt-4 grid gap-3">
                  {profile.bowlerMatchups.map((match) => (
                    <div key={match.bowler} className="rounded-2xl bg-white/5 p-3">
                      <p className="font-medium text-white">{match.bowler}</p>
                      <p className="text-sm text-gray-400">{match.runs} runs · SR {match.strikeRate} · {match.dismissals} dismissals</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-6 text-sm text-gray-300">
              <p className="font-semibold text-white mb-2">Deep stats unavailable</p>
              <p>
                This player is searchable, but comprehensive season, venue and matchup analytics require a larger IPL ball-by-ball dataset.
                Current results use local fallback and cached API data.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
