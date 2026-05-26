import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCpu, FiRefreshCw } from "react-icons/fi";
import { api } from "../lib/api";

const DEFAULT_CONTEXT = {
  source: "IPL Nexus AI",
  title: "AI cricket summary",
  prompt: "Create a concise IPL analytics summary using the current dashboard context.",
  facts: [
    "Use the Venue Analysis or Match Insights page to open this report with richer context.",
    "The floating AI assistant remains available for follow-up questions.",
  ],
};

function fallbackSummary(context) {
  const facts = context.facts || [];
  return [
    `${context.title} is driven by ${context.source}.`,
    facts.length ? `Main signal: ${facts[0]}.` : "Main signal: no local facts were provided.",
    facts.length > 1 ? `Supporting context: ${facts.slice(1).join("; ")}.` : "Add more match or venue data for a deeper tactical read.",
    "Recommended action: compare the phase trend against player matchups before final decision-making.",
  ].join(" ");
}

export default function AISummary() {
  const location = useLocation();
  const context = useMemo(() => ({ ...DEFAULT_CONTEXT, ...(location.state || {}) }), [location.state]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const response = await api.sendChat(context.prompt);
      setSummary(response?.reply || fallbackSummary(context));
    } catch {
      setSummary(fallbackSummary(context));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [context]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-ipl-cyan/80">AI Summary</p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{context.title}</h1>
            <p className="mt-2 text-sm text-gray-400">Source: {context.source}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/match-insights" className="btn-ipl-ghost flex items-center gap-2">
              <FiArrowLeft size={15} />
              Match Insights
            </Link>
            <button type="button" onClick={loadSummary} disabled={loading} className="btn-primary flex items-center gap-2">
              <FiRefreshCw className={loading ? "animate-spin" : ""} size={15} />
              Regenerate
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ipl-cyan/10 text-ipl-cyan">
              <FiCpu size={22} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Context facts</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Inputs sent to AI</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {context.facts.map((fact, index) => (
              <div key={`${fact}-${index}`} className="rounded-2xl bg-white/5 p-4 text-sm text-gray-200">
                {fact}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-ipl-card/90 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Generated read</p>
          {loading ? (
            <div className="mt-5 space-y-3">
              <div className="h-4 w-11/12 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-10/12 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-8/12 animate-pulse rounded-full bg-white/10" />
            </div>
          ) : (
            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-200">{summary}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
