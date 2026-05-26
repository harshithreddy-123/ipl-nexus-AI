const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 1;

async function timeoutPromise(ms, p) {
  let t;
  const timeout = new Promise((_, rej) => (t = setTimeout(() => rej(new Error('Timeout')), ms)));
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(t);
  }
}

export async function fetcher(url, options = {}, { retries = DEFAULT_RETRIES, timeout = DEFAULT_TIMEOUT } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await timeoutPromise(timeout, fetch(url, options));
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err = new Error(text || `Request failed: ${res.status}`);
        err.status = res.status;
        throw err;
      }
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) return res.json();
      return res.text();
    } catch (err) {
      lastErr = err;
      if (i === retries) throw lastErr;
      await new Promise((r) => setTimeout(r, 200 * (i + 1)));
    }
  }
}

export default fetcher;
