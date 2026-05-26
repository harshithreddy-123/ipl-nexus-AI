import fetcher from "./fetcher";
import MOCK from "../mock/mockData";
import * as analyticsService from "../../services/analyticsService";

const BASE = import.meta.env.VITE_API_URL || "";
const KEY = import.meta.env.VITE_CRICKET_API_KEY || "";

function buildUrl(path, params) {
  const url = `${BASE}${path}`;
  if (!params) return url;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });
  return `${url}?${search.toString()}`;
}

export async function getTrends() {
  if (!BASE) return MOCK.trends();
  try {
    return await fetcher(buildUrl("/api/trends"));
  } catch {
    return analyticsService.getTrends();
  }
}

export async function getPlayerProfile(playerId, venue = "", season = "") {
  if (!BASE) return MOCK.playerProfile(playerId, venue, season);
  try {
    return await fetcher(buildUrl("/api/player-profile", { playerId, venue, season }), {
      headers: {
        Authorization: KEY ? `Bearer ${KEY}` : "",
      },
    });
  } catch {
    return analyticsService.getPlayerProfile(playerId, venue, season);
  }
}

export async function getBowlerProfile(bowlerId, venue = "", season = "") {
  if (!BASE) return MOCK.bowlerProfile(bowlerId, venue, season);
  try {
    return await fetcher(buildUrl("/api/bowler-profile", { bowlerId, venue, season }), {
      headers: {
        Authorization: KEY ? `Bearer ${KEY}` : "",
      },
    });
  } catch {
    return analyticsService.getBowlerProfile(bowlerId, venue, season);
  }
}

export default {
  getTrends,
  getPlayerProfile,
  getBowlerProfile,
};