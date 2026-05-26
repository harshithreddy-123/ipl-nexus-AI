import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AuthPlaceholder from "./pages/AuthPlaceholder";
import AppLayout from "./layouts/AppLayout";
import Live from "./pages/Live";
import BatterVsBowler from "./pages/BatterVsBowler";
import PlayerStats from "./pages/PlayerStats";
import TeamStats from "./pages/TeamStats";
import VenueAnalysis from "./pages/VenueAnalysis";
import MatchInsights from "./pages/MatchInsights";
import Matches from "./pages/Matches";
import Players from "./pages/Players";
import Teams from "./pages/Teams";
import Analytics from "./pages/Analytics";
import Standings from "./pages/Standings";
import Predictor from "./pages/Predictor";
import Premium from "./pages/Premium";
import Settings from "./pages/Settings";
import TrendsAnalytics from "./pages/TrendsAnalytics";
import BowlingAnalytics from "./pages/BowlingAnalytics";
import PlayerAnalytics from "./pages/PlayerAnalytics";
import AISummary from "./pages/AISummary";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/register"
            element={
              <AuthPlaceholder
                title="Create account"
                message="Registration will connect to your auth API later."
              />
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthPlaceholder
                title="Forgot password"
                message="Password reset will connect to your backend later."
              />
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/players" element={<Players />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/standings" element={<Standings />} />
              <Route path="/predictor" element={<Predictor />} />
              <Route path="/live" element={<Live />} />
              <Route path="/batter-vs-bowler" element={<BatterVsBowler />} />
              <Route path="/player-stats" element={<PlayerStats />} />
              <Route path="/player-analytics" element={<PlayerAnalytics />} />
              <Route path="/team-stats" element={<TeamStats />} />
              <Route path="/venue-analysis" element={<VenueAnalysis />} />
              <Route path="/match-insights" element={<MatchInsights />} />
              <Route path="/trends-analytics" element={<TrendsAnalytics />} />
              <Route path="/bowling-analytics" element={<BowlingAnalytics />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ai-summary" element={<AISummary />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
