import { motion } from "framer-motion";

export default function TeamStats() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="rounded-2xl p-6 card">
        <h2 className="text-lg font-semibold">Team Stats</h2>
        <p className="text-sm text-gray-400 mt-2">Select a team to view wins, top batters, bowlers, and run rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">Wins / Losses</div>
        <div className="card p-4">Top batter</div>
        <div className="card p-4">Top bowler</div>
      </div>
    </motion.div>
  );
}
