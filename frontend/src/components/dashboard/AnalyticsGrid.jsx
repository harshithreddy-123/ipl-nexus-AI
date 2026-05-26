import { motion } from "framer-motion";
import { FiBarChart2, FiMapPin, FiUsers, FiZap } from "react-icons/fi";

const CARDS = [
  {
    icon: FiUsers,
    title: "Player stats",
    desc: "Batting & bowling breakdowns, strike rates, and form.",
    status: "From dataset",
  },
  {
    icon: FiBarChart2,
    title: "Team stats",
    desc: "Wins, franchise performance, and season standings.",
    status: "Coming soon",
  },
  {
    icon: FiZap,
    title: "Match insights",
    desc: "Over-by-over trends and key moments.",
    status: "Coming soon",
  },
  {
    icon: FiMapPin,
    title: "Venue analysis",
    desc: "Ground averages and chase vs defend patterns.",
    status: "Coming soon",
  },
];

export default function AnalyticsGrid({ light }) {
  return (
    <section id="insights" className="scroll-mt-16 pb-24">
      <h2 className={`mb-3 ${light ? "section-title-light" : "section-title"}`}>
        Analytics modules
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CARDS.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={light ? "card-light p-4" : "card p-4"}
          >
            <c.icon className="text-ipl-cyan mb-2" size={18} />
            <h3 className="text-sm font-semibold">{c.title}</h3>
            <p className="text-2xs text-gray-500 mt-1 leading-relaxed">{c.desc}</p>
            <span className="inline-block mt-2 text-2xs text-ipl-orange">{c.status}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
