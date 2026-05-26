import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiMail } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { isAuthenticated, login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cinematic, setCinematic] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    // Start cinematic animation while login request runs
    setCinematic(true);
    const loginPromise = login(email, password);
    const animPromise = new Promise((res) => setTimeout(res, 1200));

    const ok = await Promise.all([loginPromise, animPromise]).then((r) => r[0]).catch(() => false);
    setCinematic(false);
    if (ok) navigate("/", { replace: true });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ipl-dark px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ipl-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-ipl-orange/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="inline-block text-2xl mb-2"
          >
            🏏
          </motion.span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-ipl-gold via-ipl-orange to-ipl-cyan bg-clip-text text-transparent">
            IPL Nexus AI
          </h1>
          <p className="text-xs text-gray-500 mt-1">Smart IPL Stats &amp; Matchup Analyzer</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-ipl-card/80 backdrop-blur-xl p-6 shadow-xl"
        >
          {error && (
            <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <label className="text-2xs text-gray-500 block mb-1">Email</label>
          <div className="relative mb-3">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="email"
              required
              autoComplete="email"
              className="input-field pl-9 py-2"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label className="text-2xs text-gray-500 block mb-1">Password</label>
          <div className="relative mb-4">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="password"
              required
              autoComplete="current-password"
              className="input-field pl-9 py-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-between text-2xs mb-4">
            <Link to="/forgot-password" className="text-ipl-cyan hover:text-white transition">
              Forgot password?
            </Link>
            <Link to="/register" className="text-ipl-orange hover:text-ipl-gold transition">
              Create account
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 relative">
            {loading || cinematic ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Signing in…
              </span>
            ) : (
              "Login"
            )}
          </button>

          <p className="text-2xs text-gray-600 text-center mt-4">
            Demo: any email + password (4+ chars)
          </p>
        </form>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {["SR 142.8", "Dot 31%", "6 Wickets"].map((t) => (
            <div
              key={t}
              className="rounded-lg border border-white/5 bg-white/[0.02] py-2 text-2xs text-gray-500"
            >
              {t}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cinematic overlay: ball, bat, stumps */}
      {cinematic && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ x: -200, y: 60, rotate: 0, scale: 0.9 }}
              animate={{ x: 200, y: -40, rotate: 30, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="w-6 h-6 rounded-full bg-ipl-orange shadow-ball"
            />

            <motion.div
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 8, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute right-1/3 bottom-28 w-24 h-5 bg-ipl-gold/80 rounded-md origin-left transform rotate-0"
              style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.45)" }}
            />

            <motion.div
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0.2 }}
              transition={{ delay: 0.9, duration: 0.25 }}
              className="absolute right-1/2 bottom-16 w-12 h-12 bg-white/5 rounded-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
