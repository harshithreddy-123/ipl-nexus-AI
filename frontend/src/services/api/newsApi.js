const MOCK_NEWS = [
  {
    id: 'n1',
    title: 'IPL Nexus AI — dataset refreshed',
    summary: 'Matches and deliveries refreshed from local CSVs. Summary counts updated.',
    time: new Date().toISOString(),
    url: '/matches',
  },
  {
    id: 'n2',
    title: 'Live scores placeholder configured',
    summary: 'Live match mock data is available. Connect a live API via backend/api.py to enable real-time scores.',
    time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    url: '/live',
  },
  {
    id: 'n3',
    title: 'Upcoming: Predictor improvements',
    summary: 'Working on an improved predictor model integration for match outcomes.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    url: '/predictor',
  },
];

export async function getNews() {
  // Future: wire to an external news API or backend endpoint
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_NEWS), 300));
}

export default { getNews };
