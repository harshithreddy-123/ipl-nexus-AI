import { useState } from "react";

function Login() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (loggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-zinc-900 border border-gray-800 rounded-3xl p-10 text-center">
          <h1 className="text-4xl font-bold text-green-400 mb-4">
            Login Successful ✅
          </h1>
          <p className="text-gray-300">
            Welcome to IPL Nexus AI Dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-zinc-900 border border-gray-800 rounded-3xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-bold text-orange-500 mb-3">
          Login
        </h1>

        <p className="text-gray-300 mb-8">
          Access your IPL Nexus AI dashboard.
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full bg-zinc-800 border border-gray-700 rounded-xl px-4 py-3 mb-4 text-white"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full bg-zinc-800 border border-gray-700 rounded-xl px-4 py-3 mb-5 text-white"
        />

        <button
          onClick={() => setLoggedIn(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-xl font-bold"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;