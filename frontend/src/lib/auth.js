const AUTH_KEY = "ipl_nexus_auth";

/** Read saved session — swap this later for API / JWT validation */
export function loadSession() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(user) {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(AUTH_KEY);
}

/**
 * Demo login — replace with fetch("/api/auth/login", ...) when backend is ready
 */
export async function loginRequest(email, password) {
  await new Promise((r) => setTimeout(r, 900));

  if (!email?.trim() || !password?.trim()) {
    throw new Error("Please enter your email and password.");
  }

  if (password.length < 4) {
    throw new Error("Password must be at least 4 characters (demo rule).");
  }

  return {
    email: email.trim(),
    name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    token: "demo-token",
  };
}
