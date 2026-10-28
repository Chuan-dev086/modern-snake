// js/storage.js
import { LEADERBOARD_MAX } from "./config.js";

const BEST_SCORE_KEY = "modern_snake_best_score";
const LEADERBOARD_KEY = "modern_snake_leaderboard";

export function loadBestScore() {
  try {
    const savedScore = Number(localStorage.getItem(BEST_SCORE_KEY));
    return Number.isFinite(savedScore) && savedScore >= 0 ? savedScore : 0;
  } catch (error) {
    console.warn("Unable to load best score:", error);
    return 0;
  }
}

export function saveBestScore(score) {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch (error) {
    console.warn("Unable to save best score:", error);
  }
}

export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) => typeof e.score === "number" && Number.isFinite(e.score),
    );
  } catch (_) {
    return [];
  }
}

export function saveLeaderboard(entries) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (_) {}
}
