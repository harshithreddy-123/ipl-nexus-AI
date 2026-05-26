import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiSettings,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiX,
} from "react-icons/fi";

export default function Sidebar({ isOpen, collapsed = false, onClose, onToggleCollapse }) {
  const links = [
    { to: "/player-stats", label: "Player Analytics", icon: FiUser },
    { to: "/bowling-analytics", label: "Bowling Analytics", icon: FiTarget },
    { to: "/team-stats", label: "Team Analytics", icon: FiShield },
    { to: "/venue-analysis", label: "Venue Analysis", icon: FiMapPin },
    { to: "/trends-analytics", label: "Trends Analytics", icon: FiTrendingUp },
    { to: "/match-insights", label: "Match Insights", icon: FiActivity },
    { to: "/premium", label: "Premium Analytics", icon: FiBarChart2 },
    { to: "/settings", label: "Settings", icon: FiSettings },
  ];

  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  React.useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (isMobile) {
    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={isOpen ? { y: 0 } : { y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-white/10 bg-ipl-panel/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Explore</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-300 hover:bg-white/10"
            aria-label="Close navigation"
          >
            <FiX size={16} />
          </button>
        </div>

        <nav className="grid grid-cols-2 gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-ipl-cyan/10 font-semibold text-ipl-cyan"
                      : "text-gray-300 hover:bg-white/5"
                  }`
                }
                onClick={onClose}
              >
                <Icon size={14} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </motion.div>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`hidden h-screen border-r border-white/10 bg-ipl-panel/90 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl md:block ${
        collapsed ? "w-20" : "w-60"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-white">{collapsed ? "IPL" : "Explore"}</div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Collapse sidebar"
        >
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-ipl-cyan/10 font-semibold text-ipl-cyan shadow-inner"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`
              }
              onClick={onClose}
              title={collapsed ? link.label : undefined}
            >
              <Icon className="shrink-0" size={16} />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </motion.aside>
  );
}
