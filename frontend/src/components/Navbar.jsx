import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiMenu, FiZap } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function Navbar({ onToggleSidebar }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `relative rounded-xl px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-white/10 text-ipl-gold nav-active"
        : "text-gray-300 hover:bg-white/5 hover:text-ipl-cyan"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="mx-4 mt-4 rounded-2xl border border-white/10 bg-ipl-card/85 px-4 py-3 shadow-glow backdrop-blur-xl md:mx-0 md:mr-4 md:mt-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-gray-300 transition hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Open navigation"
        >
          <FiMenu size={18} />
        </button>

        <NavLink to="/" className="mr-3 flex shrink-0 items-center gap-2 font-bold tracking-wide text-white">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-ipl-orange to-ipl-cyan text-white shadow-lg shadow-ipl-cyan/10">
            <FiZap size={16} />
          </span>
          <span className="hidden sm:inline">IPL Nexus AI</span>
        </NavLink>

        <div className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={linkClass} end>
            Dashboard
          </NavLink>
          <NavLink to="/live" className={linkClass}>
            Live Match
          </NavLink>
          <NavLink to="/batter-vs-bowler" className={linkClass}>
            Batter vs Bowler
          </NavLink>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated && (
            <>
              <span className="hidden max-w-[140px] truncate text-xs text-gray-400 sm:inline">
                {user?.email}
              </span>
              <button type="button" onClick={handleLogout} className="btn-ipl-ghost flex items-center gap-2 px-3 py-2 text-sm">
                <FiLogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
