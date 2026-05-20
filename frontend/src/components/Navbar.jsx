import { NavLink } from "react-router-dom";

function Navbar() {
  const linkStyle = ({ isActive }) =>
    isActive
      ? "text-orange-500 font-bold"
      : "text-gray-300 hover:text-orange-500 transition";

  return (
    <nav className="bg-zinc-900 border-b border-gray-800 p-5 flex flex-wrap gap-6">
      <NavLink to="/" className={linkStyle}>Home</NavLink>
      <NavLink to="/matches" className={linkStyle}>Matches</NavLink>
      <NavLink to="/players" className={linkStyle}>Players</NavLink>
      <NavLink to="/teams" className={linkStyle}>Teams</NavLink>
      <NavLink to="/analytics" className={linkStyle}>Analytics</NavLink>
      <NavLink to="/standings" className={linkStyle}>Standings</NavLink>
      <NavLink to="/predictor" className={linkStyle}>Predictor</NavLink>
      <NavLink to="/aichat" className={linkStyle}>AI Chat</NavLink>
      <NavLink to="/login" className={linkStyle}>Login</NavLink>
    </nav>
  );
}

export default Navbar;