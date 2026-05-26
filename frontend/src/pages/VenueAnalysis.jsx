import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBarChart2, FiCpu, FiMapPin, FiTarget, FiTrendingUp, FiZap } from "react-icons/fi";
import deliveries from "../data/deliveries.json";
import matches from "../data/matches.json";
import venues from "../data/venues.json";
import { BarChart, LineChart, TrendCard } from "../components/charts/AnalyticsCharts";

const PHASE_ORDER = ["Powerplay", "Middle", "Death"];

function parseRuns(score) {
  return Number(String(score || "0").split("/")[0] || 0);
}

function summarizeVenue(venueName) {
  const venueDeliveries = deliveries.filter((item) => item.venue === venueName);
  const venueMatches = matches.filter((item) => item.venue === venueName);
  const runs = venueDeliveries.reduce((sum, item) => sum + Number(item.batsman_runs || 0), 0);
  const balls = venueDeliveries.length;
  const wickets = venueDeliveries.filter((item) => item.player_dismissed).length;
  const boundaries = venueDeliveries.filter((item) => Number(item.batsman_runs) === 4 || Number(item.batsman_runs) === 6).length;
  const firstInningsScores = venueMatches.map((item) => parseRuns(item.scoreA)).filter(Boolean);
  const avgFirstInnings = firstInningsScores.length
    ? Math.round(firstInningsScores.reduce((sum, value) => sum + value, 0) / firstInningsScores.length)
    : 0;
  const chasingWins = venueMatches.filter((item) => {
    const teamB = String(item.teamB || "").toLowerCase();
    const winner = String(item.winner || "").toLowerCase();
    return winner && teamB && winner === teamB;
  }).length;

  const phaseStats = PHASE_ORDER.map((phase) => {
    const phaseDeliveries = venueDeliveries.filter((item) => item.phase === phase);
    const phaseRuns = phaseDeliveries.reduce((sum, item) => sum + Number(item.batsman_runs || 0), 0);
    const phaseWickets = phaseDeliveries.filter((item) => item.player_dismissed).length;
    return {
      phase,
      runs: phaseRuns,
      wickets: phaseWickets,
      strikeRate: phaseDeliveries.length ? Number(((phaseRuns / phaseDeliveries.length) * 100).toFixed(1)) : 0,
    };
  });

  const keyMoments = venueDeliveries
    .filter((item) => Number(item.batsman_runs) >= 6 || item.player_dismissed)
    .slice(0, 6)
    .map((item) => ({
      over: `${item.over}.${item.ball}`,
      title: item.player_dismissed ? `${item.player_dismissed} wicket` : `${item.batsman_runs}-run impact ball`,
      detail: `${item.batter} vs ${item.bowler} in the ${item.phase || "Unknown"} phase`,
    }));

  return {
    venueMatches,
    venueDeliveries,
    runs,
    balls,
    wickets,
    boundaries,
    avgFirstInnings,
    chasingWinPct: venueMatches.length ? Math.round((chasingWins / venueMatches.length) * 100) : 0,
    runRate: balls ? Number(((runs / balls) * 6).toFixed(2)) : 0,
    boundaryPct: balls ? Number(((boundaries / balls) * 100).toFixed(1)) : 0,
    phaseStats,
    keyMoments,
    trend: venueMatches.map((item) => parseRuns(item.scoreA) + parseRuns(item.scoreB)),
  };
}

export default function VenueAnalysis() {
  const navigate = useNavigate();
  const [selectedVenue, setSelectedVenue] = useState(venues[0]?.name || "");
  const venue = venues.find((item) => item.name === selectedVenue) || venues[0];
  const summary = useMemo(() => summarizeVenue(selectedVenue), [selectedVenue]);
  const strongestPhase = summary.phaseStats.reduce((best, item) => (item.strikeRate > best.strikeRate ? item : best), summary.phaseStats[0]);

  const openAiSummary = (focus) => {
    navigate("/ai-summary", {
      state: {
        source: "Venue Analysis",
        title: `${selectedVenue} ${focus}`,
        prompt: `Create a concise IPL venue analytics summary for ${selectedVenue}. Focus: ${focus}. Average first innings ${summary.avgFirstInnings}, run rate ${summary.runRate}, chasing win ${summary.chasingWinPct}%, strongest phase ${strongestPhase?.phase}.`,
        facts: [
          `Average first innings: ${summary.avgFirstInnings}`,
          `Venue run rate: ${summary.runRate}`,
          `Chasing win percentage: ${summary.chasingWinPct}%`,
          `Boundary ball percentage: ${summary.boundaryPct}%`,
          `Strongest phase: ${strongestPhase?.phase || "N/A"} at SR ${strongestPhase?.strikeRate || 0}`,
        ],
      },
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="card overflow-hidden p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ipl-cyan/80">Venue Analysis</p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Ground intelligence and phase behavior</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-400">
              Compare scoring tempo, toss/chase behavior, boundary density, and the moments that shape matches at each IPL venue.
            </p>
          </div>
          <div className="min-w-[260px] rounded-2xl border border-white/10 bg-black/20 p-3">
            <label className="text-xs uppercase tracking-[0.24em] text-gray-500" htmlFor="venue-select">
              Venue
            </label>
            <select
              id="venue-select"
              value={selectedVenue}
              onChange={(event) => setSelectedVenue(event.target.value)}
              className="input-field mt-2"
            >
              {venues.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TrendCard title="First innings avg" value={summary.avgFirstInnings} description="Average score batting first." />
        <TrendCard title="Run rate" value={summary.runRate} description="Runs per over from local ball data." />
        <TrendCard title="Chase win" value={`${summary.chasingWinPct}%`} description="Second innings team win share." />
        <TrendCard title="Boundary balls" value={`${summary.boundaryPct}%`} description="Fours or sixes per legal ball sample." />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Venue profile</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{venue?.name}</h2>
            </div>
            <FiMapPin className="text-ipl-cyan" size={24} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["City", venue?.city],
              ["Capacity", venue?.capacity?.toLocaleString()],
              ["Pitch type", venue?.pitchType],
              ["Surface", venue?.surface],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{value || "N/A"}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => openAiSummary("overall venue read")} className="btn-primary flex items-center gap-2">
              <FiCpu size={15} />
              AI Summary
            </button>
            <button type="button" onClick={() => openAiSummary("key moments")} className="btn-ipl-ghost flex items-center gap-2">
              <FiZap size={15} />
              Key Moments
            </button>
            <button type="button" onClick={() => openAiSummary("phase analysis")} className="btn-ipl-ghost flex items-center gap-2">
              <FiBarChart2 size={15} />
              Phase Analysis
            </button>
          </div>
        </div>

        <LineChart
          title="Match scoring trend"
          subtitle="Combined match score by fixture"
          data={summary.trend.length ? summary.trend : [0]}
          color="#22b8d9"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Phase analysis</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Where the venue accelerates</h2>
            </div>
            <FiTrendingUp className="text-ipl-gold" size={22} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {summary.phaseStats.map((phase) => (
              <button
                key={phase.phase}
                type="button"
                onClick={() => openAiSummary(`${phase.phase} phase analysis`)}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-ipl-cyan/40 hover:bg-white/10"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{phase.phase}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{phase.strikeRate}</p>
                <p className="mt-1 text-sm text-gray-400">{phase.runs} runs, {phase.wickets} wickets</p>
              </button>
            ))}
          </div>
        </div>

        <BarChart
          title="Phase run split"
          subtitle="Runs by phase"
          data={summary.phaseStats.map((item) => item.runs)}
          color="#e85d26"
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Key moments</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Impact balls from this venue sample</h2>
          </div>
          <button type="button" onClick={() => openAiSummary("key moments")} className="btn-ipl-ghost flex items-center gap-2">
            <FiTarget size={15} />
            Analyze Moments
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(summary.keyMoments.length ? summary.keyMoments : [{ over: "-", title: "No impact events found", detail: "Try another venue." }]).map((moment, index) => (
            <button
              key={`${moment.over}-${index}`}
              type="button"
              onClick={() => openAiSummary(`key moment at over ${moment.over}`)}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-ipl-orange/50 hover:bg-white/10"
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
