import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiActivity, FiCpu, FiFlag, FiTarget } from "react-icons/fi";
import deliveries from "../data/deliveries.json";
import matches from "../data/matches.json";
import { BarChart, TrendCard } from "../components/charts/AnalyticsCharts";

const PHASES = ["Powerplay", "Middle", "Death"];

function scoreRuns(score) {
  return Number(String(score || "0").split("/")[0] || 0);
}

function getMatchInsight(matchId) {
  const match = matches.find((item) => item.id === matchId) || matches[0];
  const matchDeliveries = deliveries.filter((item) => item.matchId === match.id);
  const phaseStats = PHASES.map((phase) => {
    const phaseDeliveries = matchDeliveries.filter((item) => item.phase === phase);
    const runs = phaseDeliveries.reduce((sum, item) => sum + Number(item.batsman_runs || 0), 0);
    const wickets = phaseDeliveries.filter((item) => item.player_dismissed).length;
    return {
      phase,
      runs,
      wickets,
      balls: phaseDeliveries.length,
      runRate: phaseDeliveries.length ? Number(((runs / phaseDeliveries.length) * 6).toFixed(2)) : 0,
    };
  });
  const keyMoments = matchDeliveries
    .filter((item) => Number(item.batsman_runs) >= 6 || item.player_dismissed)
    .map((item) => ({
      over: `${item.over}.${item.ball}`,
      title: item.player_dismissed ? `Wicket: ${item.player_dismissed}` : `${item.batsman_runs} runs by ${item.batter}`,
      detail: `${item.batter} vs ${item.bowler} during ${item.phase}`,
    }));

  return {
    match,
    matchDeliveries,
    phaseStats,
    keyMoments,
    totalRuns: scoreRuns(match.scoreA) + scoreRuns(match.scoreB),
    wickets: matchDeliveries.filter((item) => item.player_dismissed).length,
  };
}

export default function MatchInsights() {
  const navigate = useNavigate();
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || "");
  const insight = useMemo(() => getMatchInsight(selectedMatchId), [selectedMatchId]);
  const topPhase = insight.phaseStats.reduce((best, phase) => (phase.runRate > best.runRate ? phase : best), insight.phaseStats[0]);

  const openAiSummary = (focus) => {
    navigate("/ai-summary", {
      state: {
        source: "Match Insights",
        title: `${insight.match.teamA} vs ${insight.match.teamB}: ${focus}`,
        prompt: `Create an IPL match insight summary for ${insight.match.teamA} vs ${insight.match.teamB} at ${insight.match.venue}. Focus on ${focus}. Total runs ${insight.totalRuns}, wickets ${insight.wickets}, strongest phase ${topPhase?.phase} at ${topPhase?.runRate} RPO.`,
        facts: [
          `Result: ${insight.match.result}`,
          `Venue: ${insight.match.venue}`,
          `Total runs: ${insight.totalRuns}`,
          `Wickets in sample: ${insight.wickets}`,
          `Best scoring phase: ${topPhase?.phase || "N/A"} (${topPhase?.runRate || 0} RPO)`,
        ],
      },
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ipl-cyan/80">Match Insights</p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Key moments, phases, and AI reads</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-400">
              Select a match and drill into the moments, phase tempo, and AI summary without leaving broken cards behind.
            </p>
          </div>
          <select value={selectedMatchId} onChange={(event) => setSelectedMatchId(event.target.value)} className="input-field max-w-md">
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.teamA} vs {match.teamB}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TrendCard title="Total runs" value={insight.totalRuns} description="Combined match score." />
        <TrendCard title="Wickets" value={insight.wickets} description="Dismissals from delivery sample." />
        <TrendCard title="Top phase" value={topPhase?.phase || "N/A"} description="Highest scoring run-rate phase." />
        <TrendCard title="Phase RPO" value={topPhase?.runRate || 0} description="Runs per over in top phase." />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <button type="button" onClick={() => openAiSummary("key moments")} className="card p-5 text-left">
          <FiActivity className="text-ipl-orange" size={24} />
          <h2 className="mt-4 text-lg font-semibold text-white">Key Moments</h2>
          <p className="mt-2 text-sm text-gray-400">Open an AI-backed summary of wickets, sixes, and momentum swings.</p>
        </button>
        <button type="button" onClick={() => openAiSummary("phase analysis")} className="card p-5 text-left">
          <FiFlag className="text-ipl-cyan" size={24} />
          <h2 className="mt-4 text-lg font-semibold text-white">Phase Analysis</h2>
          <p className="mt-2 text-sm text-gray-400">Compare powerplay, middle overs, and death-over scoring tempo.</p>
        </button>
        <button type="button" onClick={() => openAiSummary("AI executive summary")} className="card p-5 text-left">
          <FiCpu className="text-ipl-gold" size={24} />
          <h2 className="mt-4 text-lg font-semibold text-white">AI Summary</h2>
          <p className="mt-2 text-sm text-gray-400">Jump to the AI summary page with this match context loaded.</p>
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Phase analysis</p>
              <h2 className="mt-2 text-lg font-semibold text-white">{insight.match.teamA} vs {insight.match.teamB}</h2>
            </div>
            <button type="button" onClick={() => openAiSummary("phase analysis")} className="btn-ipl-ghost">
              AI Read
            </button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {insight.phaseStats.map((phase) => (
              <button
                key={phase.phase}
                type="button"
                onClick={() => openAiSummary(`${phase.phase} phase`)}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-ipl-cyan/40 hover:bg-white/10"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{phase.phase}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{phase.runRate}</p>
                <p className="mt-1 text-sm text-gray-400">{phase.runs} runs, {phase.wickets} wickets</p>
              </button>
            ))}
          </div>
        </div>
        <BarChart title="Runs by phase" subtitle="Current match sample" data={insight.phaseStats.map((item) => item.runs)} color="#22b8d9" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Key moments</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Momentum events</h2>
          </div>
          <button type="button" onClick={() => openAiSummary("key moments")} className="btn-primary flex items-center gap-2">
            <FiTarget size={15} />
            Summarize Moments
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(insight.keyMoments.length ? insight.keyMoments : [{ over: "-", title: "No key moments found", detail: "Select another match." }]).map((moment, index) => (
            <button
              key={`${moment.over}-${index}`}
              type="button"
              onClick={() => openAiSummary(`moment at over ${moment.over}`)}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-ipl-orange/40 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-ipl-cyan">Over {moment.over}</p>
              <p className="mt-2 font-semibold text-white">{moment.title}</p>
              <p className="mt-1 text-sm text-gray-400">{moment.detail}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
