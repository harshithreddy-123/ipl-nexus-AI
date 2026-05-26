import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { LineChart, BarChart, TrendCard } from "../components/charts/AnalyticsCharts";

export default function TrendsAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const trends = await api.getTrends();
        if (!mounted) return;
        setData(trends);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6 card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ipl-cyan/80">Trends Analytics</p>
            <h1 className="text-3xl font-semibold text-white">How T20 cricket is changing</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Season-by-season analysis of strike rate, death overs, spin vs pace scoring, and the new era of power.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2">
            <Link to="/player-stats" className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Player Analytics
            </Link>
            <Link to="/bowling-analytics" className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Bowling Analytics
            </Link>
            <Link to="/match-insights" className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Match Insights
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
          Could not load trends. Check API configuration or try again later.
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            <TrendCard
              title="Season strike rate growth"
              value={`${data.topInsights?.strikeRateTrend || "13%"} change`}
              change={data.topInsights?.strikeRateDelta || 13}
              description="Average T20 strike rate across IPL seasons."
            />
            <TrendCard
              title="Spin vs pace scoring"
              value={`${data.topInsights?.spinPaceBias || "Spin +11%"}`}
              change={data.topInsights?.spinPaceChange || 11}
              description="Spin scoring has outpaced pace year over year."
            />
            <TrendCard
              title="Powerplay momentum"
              value={`${data.topInsights?.powerplayRunRate || "8.2"} RR"`}
              change={data.topInsights?.powerplayRunRateDelta || 7}
              description="How opening overs are shaping run rates."
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <LineChart
              title="Average strike rate"
              data={data.avgStrikeRate}
              subtitle="Season-wise scoring intensity"
              color="#e85d26"
            />
            <LineChart
              title="Average first innings score"
              data={data.avgFirstInnings}
              subtitle="How chasing targets are rising"
              color="#22b8d9"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <LineChart
              title="Boundary percentage trend"
              data={data.boundaryPercentage}
              subtitle="More fours and sixes every year"
              color="#d4a72c"
            />
            <LineChart
              title="Six-hitting trend"
              data={data.sixPct}
              subtitle="Sixes per innings across seasons"
              color="#f59e0b"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <LineChart
              title="Dot ball percentage"
              data={data.dotBallPct}
              subtitle="Pressure overs and bowling control"
              color="#38bdf8"
            />
            <LineChart
              title="Powerplay run rate"
              data={data.powerplayRunRate}
              subtitle="Run acceleration in overs 1-6"
              color="#a855f7"
            />
            <LineChart
              title="Middle overs run rate"
              data={data.middleOverRunRate}
              subtitle="How teams build innings in overs 7-15"
              color="#10b981"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <LineChart
              title="Death overs run rate"
              data={data.deathOverRunRate}
              subtitle="Finishing overs intensity"
              color="#f97316"
            />
            <LineChart
              title="Bowling economy by season"
              data={data.bowlingEconomy}
              subtitle="How bowling control shifted"
              color="#22c55e"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <BarChart
              title="Wicket-taking pattern by phase"
              data={data.wicketsByPhase}
              subtitle="Powerplay, middle, death over wickets"
              color="#3b82f6"
            />
            <LineChart
              title="Team aggression trend"
              data={data.teamAggression}
              subtitle="Aggression score across seasons"
              color="#fb7185"
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-white">How T20 cricket is changing</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.insights.map((insight, index) => (
                <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-400">{insight.title}</p>
                  <p className="mt-2 text-sm text-gray-200">{insight.note}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
