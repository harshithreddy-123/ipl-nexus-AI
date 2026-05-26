import { motion } from "framer-motion";
import { FiActivity, FiBarChart2, FiTarget, FiTrendingUp } from "react-icons/fi";

const stats = [
  { label: "Strike rate", value: "142.8", trend: "+12%", color: "text-ipl-cyan" },
  { label: "Dot ball %", value: "31.2%", trend: "Elite", color: "text-ipl-gold" },
  { label: "Matchup SR", value: "158.4", trend: "vs Bumrah", color: "text-ipl-orange" },
];

const bars = [42, 68, 55, 82, 61, 94, 73, 88];

function LoginPreview() {
  return (
    <div className="relative h-full min-h-[320px] lg:min-h-0 flex flex-col justify-center p-8 lg:p-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-ipl-cyan/10 via-transparent to-ipl-orange/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-ipl-orange/20 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-ipl-cyan/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live analytics preview
        </div>

        <div className="rounded-2xl border border-ipl-gold/30 bg-black/40 backdrop-blur-md p-5 shadow-glow-gold">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">IPL • Match 42</p>
              <p className="text-lg font-bold text-white mt-1">RCB vs CSK</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-ipl-gold">186/4</p>
              <p className="text-xs text-gray-400">18.2 overs</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/5 p-3 border border-white/5">
              <p className="text-gray-400 text-xs">Batter</p>
              <p className="font-semibold text-ipl-cyan">V Kohli</p>
              <p className="text-ipl-gold font-bold mt-1">78 (52)</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 border border-white/5">
              <p className="text-gray-400 text-xs">vs Bowler</p>
              <p className="font-semibold text-ipl-orange">J Bumrah</p>
              <p className="text-gray-300 mt-1">24 off 18</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="rounded-xl border border-white/10 bg-ipl-card/80 p-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                <FiTrendingUp className="shrink-0" />
                {s.label}
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.trend}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-ipl-card/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <FiBarChart2 className="text-ipl-cyan" />
              Runs per over — matchup
            </div>
            <FiActivity className="text-ipl-orange" />
          </div>
          <div className="flex items-end gap-2 h-28">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                className="flex-1 rounded-t-md bg-gradient-to-t from-ipl-orange/80 to-ipl-cyan/60 min-h-[8px]"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-ipl-cyan/20 bg-ipl-cyan/5 px-4 py-3">
          <FiTarget className="text-ipl-cyan text-xl shrink-0" />
          <p className="text-sm text-gray-300">
            Deep dive into <span className="text-white font-medium">batter vs bowler</span>, team wins,
            and season trends — all in one dashboard.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPreview;
