import { motion } from "framer-motion";

export default function Settings() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="rounded-2xl p-6 card">
        <h2 className="text-lg font-semibold">Profile & Settings</h2>
        <p className="text-sm text-gray-400 mt-2">User profile, subscription, and app settings (placeholders).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">Account</div>
        <div className="card p-4">Subscription</div>
      </div>
    </motion.div>
  );
}
