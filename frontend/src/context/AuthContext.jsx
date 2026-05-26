import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { clearSession, loadSession, loginRequest, saveSession } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const session = await loginRequest(email, password);
      saveSession(session);
      setUser(session);
      setJustLoggedIn(true);
      return true;
    } catch (err) {
      setError(err.message || "Login failed.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearEnterAnimation = useCallback(() => setJustLoggedIn(false), []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setJustLoggedIn(false);
    setError("");
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      error,
      justLoggedIn,
      login,
      logout,
      clearEnterAnimation,
      clearError: () => setError(""),
    }),
    [user, loading, error, justLoggedIn, login, logout, clearEnterAnimation],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
