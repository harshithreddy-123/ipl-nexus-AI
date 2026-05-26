import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import ScoreboardFlip from "../components/ui/ScoreboardFlip";
import { api } from "../lib/api";

function getStatusStyle(status) {
  if (status === "LIVE") return "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
  if (status === "FINISHED") return "border border-slate-500/20 bg-slate-500/10 text-slate-200";
  if (status === "SCHEDULED") return "border border-amber-500/20 bg-amber-500/10 text-amber-200";
  return "border border-slate-500/20 bg-slate-500/10 text-slate-200";
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="card h-32 bg-white/5" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card h-40 bg-white/5" />
        <div className="card h-40 bg-white/5" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card h-48 bg-white/5" />
        <div className="card h-48 bg-white/5" />
        <div className="card h-48 bg-white/5" />
      </div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value || "-"}</p>
    </div>
  );
}

function Live() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [liveData, setLiveData] = useState({ configured: false, message: "Loading live matches...", matches: [] });
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);
  const [selectedMatchLoading, setSelectedMatchLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("coverage");

  const fetchMatchDetail = async (matchId) => {
    if (!matchId) {
      setSelectedMatchDetail(null);
      return;
    }
    setSelectedMatchLoading(true);
    try {
      const detail = await api.getLiveMatchDetail(matchId);
      setSelectedMatchDetail(detail || null);
    } catch {
      setSelectedMatchDetail(null);
    } finally {
      setSelectedMatchLoading(false);
    }
  };

  const fetchLiveScores = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const result = await api.getLiveScores();
      setLiveData(result || { configured: false, message: "No live scores available.", matches: [] });
      setLastUpdated(new Date());
      if (selectedMatchId) await fetchMatchDetail(selectedMatchId);
    } catch {
      setError("Error loading live matches. Check your connection.");
      setLiveData({ configured: false, message: "Unable to load live scores.", matches: [] });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchLiveScores();
    const interval = window.setInterval(() => {
      if (mounted) fetchLiveScores(false);
    }, 45000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!selectedMatchId && liveData.matches.length > 0) {
      const iplMatches = liveData.matches.filter((item) => /ipl|indian premier league/i.test(item.name || ""));
      const initialMatch = iplMatches.length > 0 ? iplMatches[0] : liveData.matches[0];
      setSelectedMatchId(initialMatch.id || null);
    }
  }, [liveData.matches, selectedMatchId]);

  useEffect(() => {
    fetchMatchDetail(selectedMatchId);
  }, [selectedMatchId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await fetchLiveScores(false);
    } catch {
      setError("Error refreshing live matches. Try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const iplMatches = liveData.matches.filter((item) => /ipl|indian premier league/i.test(item.name || ""));
  const matchesToShow = iplMatches.length > 0 ? iplMatches : liveData.matches;
  const selectedMatch = selectedMatchDetail?.match || matchesToShow.find((item) => item.id === selectedMatchId) || matchesToShow[0] || null;
  const currentInnings = selectedMatch?.scoreDetails?.[0] || null;
  const batters = selectedMatch?.batters || selectedMatch?.raw?.currentInnings?.batsmen || [];
  const bowlers = selectedMatch?.bowlers || selectedMatch?.raw?.currentInnings?.bowlers || [];
  const commentary = selectedMatch?.commentary || selectedMatch?.raw?.commentary || [];
  const partnership = selectedMatch?.partnership || selectedMatch?.raw?.currentInnings?.partnership || null;
  const tabs = useMemo(
    () => [
      { id: "coverage", label: "Coverage" },
      { id: "scorecard", label: "Scorecard" },
      { id: "stats", label: "Stats" },
      { id: "commentary", label: "Commentary" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Match</h1>
          <p className="mt-0.5 text-2xs text-gray-400">CREX-style live coverage with resilient API fallback</p>
          {lastUpdated && <p className="mt-1 text-2xs text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-primary flex items-center gap-2" title="Refresh live data">
          <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Updating" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="card flex items-start gap-3 border-red-500/30 bg-red-500/10 p-4">
          <FiAlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">{error}</p>
            <button onClick={() => fetchLiveScores(false)} className="mt-1 text-2xs text-red-400 underline hover:text-red-300">
              Try again
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-gray-400">Live scores</p>
                <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
                  {selectedMatch ? selectedMatch.name : "No live match selected"}
                </h2>
                <p className="mt-2 text-sm text-gray-400">{liveData.message}</p>
              </div>
              {selectedMatch && (
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusStyle(selectedMatch.status)}`}>
                  {selectedMatch.status}
                </span>
              )}
            </div>

            {selectedMatch ? (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MiniMetric label="Teams" value={`${selectedMatch.teamNames?.[0]} vs ${selectedMatch.teamNames?.[1]}`} />
                  <MiniMetric label="Score" value={`${selectedMatch.scoreA || "-"} / ${selectedMatch.scoreB || "-"}`} />
                  <MiniMetric label="Venue" value={selectedMatch.venue || "TBA"} />
                  <MiniMetric label="Phase" value={selectedMatch.phase || "T20"} />
                </div>

                <div className="mt-8 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
                  <div className="rounded-3xl border border-white/10 bg-ipl-card/95 p-5">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <p className="text-sm font-semibold text-white">Live score fetch</p>
                        <p className="text-xs text-gray-400">
                          {selectedMatchLoading ? "Loading match details..." : selectedMatchDetail?.message || liveData.message}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <ScoreboardFlip
                        teamA={selectedMatch.teamNames?.[0]}
                        teamB={selectedMatch.teamNames?.[1]}
                        scoreA={selectedMatch.scoreA || "-"}
                        scoreB={selectedMatch.scoreB || "-"}
                        oversA={selectedMatch.scoreDetails?.[0]?.overs || "--"}
                        oversB={selectedMatch.scoreDetails?.[1]?.overs || "--"}
                        live={selectedMatch.status === "LIVE"}
                      />
                    </div>
                  </div>
                  <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MiniMetric label="Toss" value={selectedMatch.toss || "Unavailable"} />
                      <MiniMetric label="Last ball" value={selectedMatch.lastBall || "-"} />
                      <MiniMetric label="Run rate" value={selectedMatch.runRate || "-"} />
                      <MiniMetric label="Required rate" value={selectedMatch.requiredRate || "-"} />
                    </div>
                    <div className="rounded-2xl bg-ipl-panel/90 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">Match date</p>
                      <p className="mt-2 text-sm font-semibold text-white">{selectedMatch.date || selectedMatch.dateTimeGMT || "TBA"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-ipl-panel/80 p-4">
                  <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                          activeTab === tab.id ? "bg-ipl-cyan/15 text-ipl-cyan shadow-inner" : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "coverage" && (
                    <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-2xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Batters</p>
                        <div className="mt-4 overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead className="text-xs uppercase tracking-[0.18em] text-gray-500">
                              <tr><th className="py-2 pr-4">Batter</th><th className="py-2 pr-4">R</th><th className="py-2 pr-4">B</th><th className="py-2 pr-4">4s</th><th className="py-2 pr-4">6s</th><th className="py-2">SR</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                              {(batters.length ? batters.slice(0, 5) : [{ name: "Awaiting data", runs: "-", balls: "-", fours: "-", sixes: "-", strikeRate: "-" }]).map((batter, index) => (
                                <tr key={`${batter.name}-${index}`} className={batter.isStriker ? "text-ipl-gold" : "text-gray-200"}>
                                  <td className="py-3 pr-4 font-medium">{batter.name}{batter.isStriker ? " *" : ""}</td>
                                  <td className="py-3 pr-4">{batter.runs}</td>
                                  <td className="py-3 pr-4">{batter.balls}</td>
                                  <td className="py-3 pr-4">{batter.fours}</td>
                                  <td className="py-3 pr-4">{batter.sixes}</td>
                                  <td className="py-3">{batter.strikeRate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <MiniMetric label="Partnership" value={partnership ? `${partnership.runs} (${partnership.balls})` : "Pending"} />
                        <div className="rounded-2xl bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Win probability</p>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-ipl-orange to-ipl-cyan" />
                          </div>
                          <p className="mt-2 text-sm text-gray-400">Predictive model placeholder, ready for provider data.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "scorecard" && (
                    <div className="mt-5 overflow-x-auto rounded-2xl bg-white/5 p-4">
                      <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.18em] text-gray-500">
                          <tr><th className="py-2 pr-4">Bowler</th><th className="py-2 pr-4">O</th><th className="py-2 pr-4">M</th><th className="py-2 pr-4">R</th><th className="py-2 pr-4">W</th><th className="py-2">Econ</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {(bowlers.length ? bowlers.slice(0, 6) : [{ name: "Awaiting data", overs: "-", maidens: "-", runs: "-", wickets: "-", economy: "-" }]).map((bowler, index) => (
                            <tr key={`${bowler.name}-${index}`} className={bowler.isCurrent ? "text-ipl-cyan" : "text-gray-200"}>
                              <td className="py-3 pr-4 font-medium">{bowler.name}{bowler.isCurrent ? " *" : ""}</td>
                              <td className="py-3 pr-4">{bowler.overs}</td>
                              <td className="py-3 pr-4">{bowler.maidens}</td>
                              <td className="py-3 pr-4">{bowler.runs}</td>
                              <td className="py-3 pr-4">{bowler.wickets}</td>
                              <td className="py-3">{bowler.economy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === "stats" && (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <MiniMetric label="Overs" value={currentInnings?.overs || "-"} />
                      <MiniMetric label="Run rate" value={selectedMatch.runRate || "-"} />
                      <MiniMetric label="Required rate" value={selectedMatch.requiredRate || "-"} />
                      <MiniMetric label="Venue" value={selectedMatch.venue || "TBA"} />
                    </div>
                  )}

                  {activeTab === "commentary" && (
                    <div className="mt-5 space-y-3">
                      {(commentary.length ? commentary : [{ over: "-", ball: "-", text: selectedMatch.comment || "Commentary will appear as the provider sends updates." }]).slice(0, 8).map((item, index) => (
                        <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Over {item.over}.{item.ball}</p>
                          <p className="mt-2 text-sm text-gray-200">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
                <p className="text-sm text-gray-300">No live matches are currently available.</p>
                <p className="mt-3 text-sm text-gray-400">Once the live feed is enabled and matches are active, the latest scorecard will appear here.</p>
              </div>
            )}
          </div>

          {matchesToShow.length > 0 && (
            <div className="grid gap-4 xl:grid-cols-2">
              {matchesToShow.slice(0, 7).map((match, index) => (
                <button
                  type="button"
                  key={match.id || index}
                  onClick={() => setSelectedMatchId(match.id || null)}
                  className={`text-left rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 ${
                    match.id === selectedMatch?.id ? "border-ipl-orange bg-ipl-card/90" : "border-white/10 bg-ipl-card/95 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-gray-400">{match.venue}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{match.name || `${match.teamNames?.[0]} vs ${match.teamNames?.[1]}`}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusStyle(match.status)}`}>{match.status}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MiniMetric label="Score" value={`${match.scoreA || "-"} / ${match.scoreB || "-"}`} />
                    <MiniMetric label="Last ball" value={match.lastBall || "-"} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-400">{match.comment || match.status || "Live match details"}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Live;
