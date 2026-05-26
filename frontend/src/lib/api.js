import cricketApi from "../services/cricketApi";
import analyticsApi from "../services/api/analyticsApi";
import aiApi from "../services/api/aiApi";
import { getMatchup } from "../services/playerSearchService";

export const api = {
  getSummary: () => cricketApi.getSummary(),
  getPlayers: (role) => cricketApi.getPlayers(role),
  searchPlayers: (query, role) => cricketApi.searchPlayers(query, role),
  getPlayerInfo: (playerId) => cricketApi.getPlayerInfo(playerId),
  getCurrentMatches: () => cricketApi.getCurrentMatches(),
  getMatchInfo: (matchId) => cricketApi.getMatchInfo(matchId),
  getScorecard: (matchId) => cricketApi.getScorecard(matchId),
  getMatchup,
  getLiveScores: () => cricketApi.getLiveScores(),
  getLiveMatchDetail: (matchId) => cricketApi.getLiveMatchDetail(matchId),
  syncLatestData: () => cricketApi.syncLatestData(),
  getTrends: () => analyticsApi.getTrends(),
  getPlayerProfile: (playerId, venue, season) => analyticsApi.getPlayerProfile(playerId, venue, season),
  getBowlerProfile: (bowlerId, venue, season) => analyticsApi.getBowlerProfile(bowlerId, venue, season),
  sendChat: (message) => aiApi.sendChat(message),
};

export default api;
