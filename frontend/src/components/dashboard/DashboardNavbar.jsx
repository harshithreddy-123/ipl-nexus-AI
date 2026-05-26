import { FiMoon, FiSearch, FiSun } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#matchup", label: "Matchup" },
  { href: "#live", label: "Live" },
  { href: "#insights", label: "Insights" },
];

export default function DashboardNavbar({ theme, onToggleTheme, search, onSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = (user?.name || user?.email || "U")[0].toUpperCase();
  const isLight = theme === "light";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md ${
        isLight ? "border-gray-200 bg-white/90" : "border-white/10 bg-ipl-panel/95"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-lg">🏏</span>
          <span className={`text-sm font-bold ${isLight ? "text-gray-900" : "text-ipl-gold"}`}>
            IPL Nexus AI
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-4">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="relative flex-1 min-w-[140px] max-w-xs ml-auto md:ml-0">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="search"
            placeholder="Search players…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className={isLight ? "input-field-light pl-8 py-1.5" : "input-field pl-8 py-1.5"}
          />
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className={`p-2 rounded-lg transition ${
            isLight ? "hover:bg-gray-100" : "hover:bg-white/5"
          }`}
          aria-label="Toggle theme"
        >
          {isLight ? <FiMoon size={16} /> : <FiSun size={16} />}
        </button>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
            isLight ? "bg-ipl-orange/15 text-ipl-orange" : "bg-ipl-cyan/20 text-ipl-cyan"
          }`}
          title={user?.email}
        >
          {initial}
        </div>

        <button type="button" onClick={handleLogout} className="text-xs text-gray-500 hover:text-ipl-orange">
          Logout
        </button>
      </div>
    </header>
  );
}
