import { useCallback, useEffect, useState } from 'react';
import cricketApi from '../services/api/cricketApi';
import { getMatchup as getLocalMatchup } from '../services/playerSearchService';

export function useCricketService() {
  const [summary, setSummary] = useState(null);
  const [batters, setBatters] = useState([]);
  const [bowlers, setBowlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [s, b, w] = await Promise.all([cricketApi.getSummary(), cricketApi.getPlayers('batter'), cricketApi.getPlayers('bowler')]);
        if (cancelled) return;
        setSummary(s);
        setBatters(b.players || []);
        setBowlers(w.players || []);
      } catch (err) {
        setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => (cancelled = true);
  }, []);

  const getMatchup = useCallback(async (batter, bowler) => {
    return getLocalMatchup(batter, bowler);
  }, []);

  return { summary, batters, bowlers, loading, error, getMatchup };
}

export default useCricketService;
