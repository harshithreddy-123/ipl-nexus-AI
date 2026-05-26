import { motion } from "framer-motion";

function InsightCard({ label, value, note, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-3xl border border-white/10 bg-ipl-card/90 p-4 shadow-sm"
    >
      <p className="text-2xs uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {note && <p className="mt-2 text-sm text-gray-400">{note}</p>}
    </motion.div>
  );
}

export default function HeroStats({ summary, userName, apiOnline }) {
  const s = summary || {};

  return (
    <section id="overview" className="scroll-mt-16 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Welcome back{userName ? `, ${userName}` : ""}</h1>
        <p className="text-xs text-gray-400 mt-1">
          Advanced IPL insights, evolving trends, and matchup intelligence — not just totals.
        </p>
        {!apiOnline && (
          <p className="text-2xs text-amber-500/90 mt-2">
            API offline — run: <code className="text-ipl-cyan">uvicorn api:app --reload --port 8000</code> in <code>backend/</code>
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          label="Today’s key insight"
          value={s.keyInsight || "Strike rate is on the rise across IPL seasons."}
          note={s.topTrend}
          delay={0.05}
        />
        <InsightCard
          label="Most improved strike rate"
          value={s.mostImprovedSR || "+16%"}
          note="Top player gaining pace in powerplay and middle overs."
          delay={0.1}
        />
        <InsightCard
          label="Best death overs batter"
          value={s.bestDeathOversBatter || "Rohit Sharma"}
          note="Explosive finishers are rewriting death overs benchmarks."
          delay={0.15}
        />
        <InsightCard
          label="Best powerplay bowler"
          value={s.bestPowerplayBowler || "Yuzvendra Chahal"}
          note="Control and wickets in the first six overs."
          delay={0.2}
        />
      </div>
    </section>
  );
}
