import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-zinc-950 border-r border-gray-800 min-h-screen p-5">

      <h1 className="text-3xl font-bold text-orange-500 mb-10">
        IPL
      </h1>

      <div className="flex flex-col gap-5 text-lg">

        <Link to="/">Home</Link>

        <Link to="/live">Live</Link>

        <Link to="/teams">Teams</Link>

        <Link to="/players">Players</Link>

        <Link to="/standings">Standings</Link>

        <Link to="/ai">AI Chat</Link>

      </div>

    </div>
  );
}

export default Sidebar;