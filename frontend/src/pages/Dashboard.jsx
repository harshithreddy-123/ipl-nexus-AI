import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import dashboardApi from "../services/api/dashboardApi";
import newsApi from "../services/api/newsApi";

export default function Dashboard() {
  const { user, justLoggedIn, clearEnterAnimation } = useAuth();
  const [theme] = useState(() => localStorage.getItem("ipl-theme") || "dark");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [news, setNews] = useState([]);

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("ipl-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (justLoggedIn) {
      const t = setTimeout(clearEnterAnimation, 600);
      return () => clearTimeout(t);
    }
  }, [justLoggedIn, clearEnterAnimation]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dashboardApi
      .getOverview()
      .then((d) => {
        if (!mounted) return;
        setOverview(d);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    newsApi.getNews().then((n) => mounted && setNews(n)).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const light = theme === "light";
  return (
    <div className={light ? "text-gray-900" : "text-gray-100"}>
      <header className="rounded-2xl border border-white/10 bg-ipl-panel/80 px-4 py-4 backdrop-blur-sm md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ipl-cyan/80">Dashboard</p>
            <h1 className={`text-xl font-semibold ${light ? "text-gray-900" : "text-white"}`}>
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>
          </div>
          <p className="text-2xs text-gray-400 max-w-2xl">
            Your IPL intelligence hub with matchup analysis, live mock scores, and performance insights.
          </p>
        </div>
      </header>
      <motion.main
        initial={justLoggedIn ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6 pt-6"
      >
        {loading ? (
          <div className="flex items-center gap-3 text-sm text-gray-500 py-12">
            <span className="h-5 w-5 rounded-full border-2 border-ipl-cyan border-t-transparent animate-spin" />
            Loading dashboard…
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Failed to load dashboard: {error.message}</div>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-3">
              <div className="col-span-2 rounded-2xl border border-white/10 bg-ipl-card/90 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className={`text-lg font-semibold ${light ? 'text-gray-900' : 'text-white'}`}>Latest News</h2>
                    <p className="mt-3 text-sm text-gray-400">Keep up with IPL updates, feature releases, and key Nexus AI insights.</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-ipl-cyan/10 px-3 py-1 text-xs font-medium text-ipl-cyan">Top stories</span>
                </div>
                <div className="mt-5 space-y-4">
                  {news.length ? (
                    news.slice(0, 3).map((item) => (
                      <Link
                        key={item.id}
                        to={item.url}
                        className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-ipl-cyan/30 hover:bg-white/10"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                          <span className="text-xs text-gray-400">{new Date(item.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">{item.summary}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-gray-400">No news available yet. Please check back soon.</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-ipl-card/90 p-6">
                <h3 className="text-sm uppercase tracking-[0.22em] text-ipl-cyan/80">At a glance</h3>
                <p className="mt-2 text-xs text-gray-400">Quick stats from dataset</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-2xl font-semibold text-white">{overview.totalMatches}</p>
                    <p className="text-xs text-gray-400">Total Matches</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-2xl font-semibold text-white">{overview.totalPlayers}</p>
                    <p className="text-xs text-gray-400">Total Players</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-2xl font-semibold text-white">{overview.totalTeams}</p>
                    <p className="text-xs text-gray-400">Total Teams</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-2xl font-semibold text-white">{overview.totalVenues}</p>
                    <p className="text-xs text-gray-400">Total Venues</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-ipl-card/90 p-6 text-center">
                <p className="text-sm text-gray-400">Total Runs</p>
                <p className="mt-3 text-2xl font-semibold text-white">{overview.totalRuns.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ipl-card/90 p-6 text-center">
                <p className="text-sm text-gray-400">Total Wickets</p>
                <p className="mt-3 text-2xl font-semibold text-white">{overview.totalWickets.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ipl-card/90 p-6">
                <h4 className="text-sm font-medium text-white">Quick Links</h4>
                <div className="mt-4 grid gap-2">
                  <Link to="/player-stats" className="text-sm text-gray-300 hover:text-white">Player Analytics</Link>
                  <Link to="/trends-analytics" className="text-sm text-gray-300 hover:text-white">Trends</Link>
                  <Link to="/match-insights" className="text-sm text-gray-300 hover:text-white">Match Insights</Link>
                </div>
              </div>
            </section>

            <div className="pt-2 text-xs text-gray-400">API status: {overview.liveMatchStatus || 'N/A'}</div>
          </>
        )}
      </motion.main>
    </div>
  );
}
