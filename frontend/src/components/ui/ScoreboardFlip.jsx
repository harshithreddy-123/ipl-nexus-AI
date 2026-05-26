import { motion } from "framer-motion";

export default function ScoreboardFlip({ teamA, teamB, scoreA, scoreB, oversA, oversB, live, animateEntry = true }) {
  return (
    <motion.div
      initial={animateEntry ? { opacity: 0, y: 12, scale: 0.98 } : false}
      animate={animateEntry ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
    >
      <div className="card p-4 text-center">
        <div className="text-sm text-gray-400">{teamA}</div>
        <motion.div
          initial={{ rotateX: 0 }}
          animate={{ rotateX: live ? [0, -10, 0] : 0 }}
          transition={{ duration: 0.9, repeat: live ? Infinity : 0 }}
          className="text-3xl font-bold mt-1"
        >
          {scoreA}
        </motion.div>
        <div className="text-2xs text-gray-400">{oversA} overs</div>
      </div>

      <div className="card p-4 text-center bg-gradient-to-br from-ipl-cyan/10 to-ipl-orange/6 scoreboard-card">
        <div className="text-sm text-gray-400">Live</div>
        <motion.div
          initial={{ scale: 0.98 }}
          animate={{ scale: live ? [0.98, 1.02, 0.98] : 1 }}
          transition={{ duration: 1.2, repeat: live ? Infinity : 0 }}
          className="text-2xl font-semibold mt-1"
        >
          {teamA} vs {teamB}
        </motion.div>
        <div className="text-2xs text-gray-400 mt-1">Stadium: {"Chennai"}</div>
      </div>

      <div className="card p-4 text-center">
        <div className="text-sm text-gray-400">{teamB}</div>
        <motion.div
          initial={{ rotateX: 0 }}
          animate={{ rotateX: live ? [0, 10, 0] : 0 }}
          transition={{ duration: 0.9, repeat: live ? Infinity : 0 }}
          className="text-3xl font-bold mt-1"
        >
          {scoreB}
        </motion.div>
        <div className="text-2xs text-gray-400">{oversB} overs</div>
      </div>
    </motion.div>
  );
}
