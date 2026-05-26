const CACHE_PREFIX = "ipl-nexus-ai";
const DEFAULT_TTL = 1000 * 60 * 60 * 24;

function buildKey(key) {
  return `${CACHE_PREFIX}:${key}`;
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isStorageAvailable() {
  try {
    const key = `${CACHE_PREFIX}:__test__`;
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = typeof window !== "undefined" && isStorageAvailable();

export const cacheService = {
  getCache(key) {
    if (!storageAvailable) return null;
    try {
      const payload = safeParse(window.localStorage.getItem(buildKey(key)) || "");
      if (!payload || typeof payload !== "object" || payload.value === undefined) {
        return null;
      }
      if (payload.expiresAt && Date.now() > payload.expiresAt) {
        window.localStorage.removeItem(buildKey(key));
        return null;
      }
      return payload.value;
    } catch {
      return null;
    }
  },

  setCache(key, value, ttl = DEFAULT_TTL) {
    if (!storageAvailable) return false;
    try {
      const payload = {
        value,
        expiresAt: Date.now() + ttl,
      };
      window.localStorage.setItem(buildKey(key), JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  },

  removeCache(key) {
    if (!storageAvailable) return false;
    try {
      window.localStorage.removeItem(buildKey(key));
      return true;
    } catch {
      return false;
    }
  },

  clearCache(prefix = "") {
    if (!storageAvailable) return false;
    try {
      const keys = Object.keys(window.localStorage);
      keys.forEach((item) => {
        if (!prefix || item.startsWith(buildKey(prefix)) || item.startsWith(`${CACHE_PREFIX}:`)) {
          window.localStorage.removeItem(item);
        }
      });
      return true;
    } catch {
      return false;
    }
  },
};
