import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../lib/api";

function getStatusStyle(status) {
  if (status === "LIVE") return "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20";
  if (status === "PAUSED") return "bg-amber-500/10 text-amber-200 border border-amber-500/20";
  return "bg-slate-500/10 text-slate-200 border border-slate-500/20";
}

export default function LiveScores({ light }) {
  const [data, setData] = useState({ configured: false, message: "Loading live scores…", matches: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getLiveScores()
      .then((payload) => setData(payload))
      .catch(() =>
        setData({
          configured: false,
          message: "Live scores will be fetched from cricket API. Add CRICKET_API_KEY to .env.",
          matches: [],
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="live" className="scroll-mt-16">
      <h2 className={`mb-3 ${light ? "section-title-light" : "section-title"}`}>Live scores</h2>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={light ? "card-light p-5" : "card p-5"}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-2.5 w-2.5 mt-1 rounded-full bg-emerald-500 animate-pulse-soft" />
            <div>
              <p className="text-sm font-semibold text-white">{data.message}</p>
              <p className="text-2xs text-gray-400 mt-1">
                {data.configured
                  ? "API key detected — backend live scores are active."
                  : "Set CRICKET_API_KEY in .env to enable live match data."}
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-white/5 px-3 py-2 text-xs text-gray-300">{data.matches.length} match{data.matches.length === 1 ? "" : "es"} tracked</div>
            <div className="rounded-2xl bg-white/5 px-3 py-2 text-xs text-gray-300">{data.configured ? "Live feed enabled" : "Mock fallback active"}</div>
            <div className="rounded-2xl bg-white/5 px-3 py-2 text-xs text-gray-300">Updated just now</div>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : data.matches.length > 0 ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {data.matches.map((match, index) => (
              <div key={index} className="rounded-3xl border border-white/10 bg-ipl-card/95 p-5 shadow-sm transition hover:-translate-y-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-gray-400">
                      <span>{match.venue}</span>
                      <span>·</span>
                      <span>{match.phase}</span>
                    </div>
                    <div className="text-xl font-semibold text-white">{match.name || `${match.teamNames[0]} vs ${match.teamNames[1]}`}</div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                      <div className="rounded-3xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-400">{match.teamNames[0]}</p>
                        <p className="mt-3 text-3xl font-semibold text-white">{match.scoreA || '—'}</p>
                        <p className="mt-1 text-sm text-gray-400">Batting</p>
                      </div>
                      <div className="hidden lg:flex items-center justify-center">
                        <span className="rounded-full bg-ipl-panel/80 px-4 py-2 text-sm font-semibold text-white border border-white/10">VS</span>
                      </div>
                      <div className="rounded-3xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-400">{match.teamNames[1]}</p>
                        <p className="mt-3 text-3xl font-semibold text-white">{match.scoreB || '—'}</p>
                        <p className="mt-1 text-sm text-gray-400">Bowling</p>
                      </div>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusStyle(match.status)}`}>{match.status}</span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Current run rate</p>
                    <p className="mt-2 text-lg font-semibold text-white">{match.runRate}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Target / lead</p>
                    <p className="mt-2 text-lg font-semibold text-white">{match.lead}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Last ball</p>
                    <p className="mt-2 text-lg font-semibold text-white">{match.lastBall}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Next bowler</p>
                    <p className="mt-2 text-lg font-semibold text-white">{match.nextBowler}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Previous deliveries</p>
                      <p className="mt-1 text-xs text-gray-400">Most recent on the right</p>
                    </div>
                    <span className="text-xs text-gray-300">{match.previousBalls.length} balls</span>
                  </div>
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {match.previousBalls.map((ball, ballIndex) => (
                      <div
                        key={ballIndex}
                        className="min-w-[3.2rem] rounded-2xl border border-white/10 bg-ipl-panel/90 px-3 py-2 text-center text-sm font-semibold text-white"
                      >
                        {ball}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-gray-400">{match.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
            <p className="text-sm text-gray-300">No live matches are currently available.</p>
            <p className="mt-3 text-sm text-gray-400">Once you enable the cricket API key or the live feed, this section will show active match cards with run-rate momentum and finish-line pressure.</p>
          </div>
        )}
      </motion.div>
    </section>
  );
}
