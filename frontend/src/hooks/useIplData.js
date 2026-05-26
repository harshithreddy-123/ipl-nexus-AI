import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

const FALLBACK_SUMMARY = {
  keyInsight: "Strike rate is now trending above 138 across IPL seasons.",
  topTrend: "Powerplay run rate is driving the new era of aggressive starts.",
  mostImprovedSR: "Player form is peaking with +16% SR gains this season.",
  bestDeathOversBatter: "Rohit Sharma leading death over scoring.",
  bestPowerplayBowler: "Spin specialists are controlling powerplay economy.",
  spinPaceBias: "Spin scoring advantage up 10% over pace.",
  seasons: ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
};

export function useIplData() {
  const [summary, setSummary] = useState(null);
  const [batters, setBatters] = useState([]);
  const [bowlers, setBowlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [s, b, w] = await Promise.all([
          api.getSummary(),
          api.getPlayers("batter"),
          api.getPlayers("bowler"),
        ]);
        if (cancelled) return;
        setSummary(s);
        setBatters(b.players || []);
        setBowlers(w.players || []);
        setApiOnline(true);
      } catch {
        if (!cancelled) {
          setSummary(FALLBACK_SUMMARY);
          setBatters([]);
          setBowlers([]);
          setApiOnline(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchMatchup = useCallback(async (batter, bowler) => {
    if (!batter || !bowler) return null;
    return api.getMatchup(batter, bowler);
  }, []);

  return { summary, batters, bowlers, loading, apiOnline, fetchMatchup };
}
