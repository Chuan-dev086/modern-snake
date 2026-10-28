// js/config.js
export const GRID_SIZE = 20;
export const FOOD_SCORE = 10;
export const LEVEL_SCORE = 50;
export const SPECIAL_FOOD_INTERVAL = 3;
export const SPECIAL_FOOD_CHANCE = 0.7;
export const SPECIAL_FOOD_DURATION = 6000;

export const SPECIAL_FOOD_TYPES = [
  { type: "golden", emoji: "⭐", points: 30 },
  { type: "crystal", emoji: "💎", points: 20 },
  { type: "trimmer", emoji: "✂️", points: 15 },
];

export const DIFFICULTIES = { easy: 180, normal: 120, hard: 75 };
export const LEADERBOARD_MAX = 5;
