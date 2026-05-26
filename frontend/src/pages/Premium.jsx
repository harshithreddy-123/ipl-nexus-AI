import { motion } from "framer-motion";

export default function Premium() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="rounded-2xl p-6 card">
        <h2 className="text-lg font-semibold">Premium Analytics</h2>
        <p className="text-sm text-gray-400 mt-2">Premium analytics features are locked. Connect subscription to unlock.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">Advanced Match Predictions (Pro)</div>
        <div className="card p-4">Export Reports (Pro)</div>
        <div className="card p-4">Team Depth Insights (Pro)</div>
      </div>
    </motion.div>
  );
}
