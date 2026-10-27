/* ========================================
   Modern Snake Game
   Special Food & Bonus Rewards | Phase 2 Modes | Phase 4 Leaderboard
======================================== */

// 1. Get HTML Elements
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const gameBoard = document.querySelector(".game-board");

const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");
const levelElement = document.getElementById("level");
const statusElement = document.getElementById("game-status");

const overlay = document.getElementById("game-overlay");
const overlayIcon = document.getElementById("overlay-icon");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");

const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const restartButton = document.getElementById("restart-button");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const difficultySelect = document.getElementById("difficulty");
const gameModeSelect = document.getElementById("game-mode");

const buffBarContainer = document.getElementById("buff-bar-container");
const buffIcon = document.getElementById("buff-icon");
const buffTitle = document.getElementById("buff-title");
const buffTimer = document.getElementById("buff-timer");
const buffProgressFill = document.getElementById("buff-progress-fill");

// Leaderboard DOM references
const leaderboardModal = document.getElementById("leaderboard-modal");
const leaderboardList = document.getElementById("leaderboard-list");
const lbCloseBtn = document.getElementById("lb-close-btn");
const lbPlayAgainBtn = document.getElementById("lb-play-again-btn");

// 2. Game Configuration
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

const FOOD_SCORE = 10;
const LEVEL_SCORE = 50;

// Special food configuration
const SPECIAL_FOOD_INTERVAL = 3;
const SPECIAL_FOOD_CHANCE = 0.7;
const SPECIAL_FOOD_DURATION = 6000;

const SPECIAL_FOOD_TYPES = [
  {
    type: "golden",
    emoji: "⭐",
    points: 30,
  },
  {
    type: "crystal",
    emoji: "💎",
    points: 20,
  },
  {
    type: "trimmer",
    emoji: "✂️",
    points: 15,
  },
];

const DIFFICULTIES = {
  easy: 180,
  normal: 120,
  hard: 75,
};

// 3. Game State
let snake;
let food;
let specialFood;
let obstacles = [];

let direction;
let nextDirection;

let score = 0;
let level = 1;
let bestScore = loadBestScore();

let normalFoodEaten = 0;
let gameState = "ready";
let gameLoop = null;
let currentSpeed = DIFFICULTIES.normal;

// Game Mode: "classic" | "portal" | "obstacles"
let gameMode = "classic";

// Active Buff / Power-up state (Tail Trimmer etc.)
let activeBuff = null; // { type, name, icon, duration, expiresAt, remaining }

// Particle and Floating Text Systems
let particles = [];
let floatingTexts = [];
let animationFrameId = null;
let lastFrameTime = performance.now();

// 4. Load Best Score
function loadBestScore() {
  try {
    const savedScore = Number(localStorage.getItem("modern_snake_best_score"));

    return Number.isFinite(savedScore) && savedScore >= 0 ? savedScore : 0;
  } catch (error) {
    console.warn("Unable to load best score:", error);
    return 0;
  }
}

// 5. Save Best Score
function saveBestScore() {
  try {
    localStorage.setItem("modern_snake_best_score", String(bestScore));
  } catch (error) {
    console.warn("Unable to save best score:", error);
  }
}

// ── Leaderboard (Top-5) ──────────────────────────────────────

const LEADERBOARD_KEY = "modern_snake_leaderboard";
const LEADERBOARD_MAX = 5;

/** Returns the stored leaderboard array (sorted highest first). */
function loadLeaderboard() {
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

/** Saves the leaderboard array. */
function saveLeaderboard(entries) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (_) {}
}

/**
 * Adds the given score to the leaderboard if it qualifies.
 * Returns the updated board and the index of the new entry (-1 if not added).
 */
function submitScore(newScore) {
  if (newScore <= 0) return { entries: loadLeaderboard(), newIndex: -1 };

  const entries = loadLeaderboard();
  const entry = {
    score: newScore,
    date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    mode: gameMode,
  };

  entries.push(entry);
  entries.sort((a, b) => b.score - a.score);

  // Keep only top-N
  const trimmed = entries.slice(0, LEADERBOARD_MAX);
  const newIndex = trimmed.findIndex((e) => e === entry);

  saveLeaderboard(trimmed);
  return { entries: trimmed, newIndex };
}

/** Renders the leaderboard list into the modal. */
function renderLeaderboard(entries, newIndex) {
  leaderboardList.innerHTML = "";

  const RANK_ICONS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

  for (let i = 0; i < LEADERBOARD_MAX; i++) {
    const li = document.createElement("li");
    li.className = "lb-entry";

    if (i < entries.length) {
      const e = entries[i];
      const isNew = i === newIndex;
      if (isNew) li.classList.add("lb-new");

      const modeLabel =
        e.mode === "portal" ? "Portal" : e.mode === "obstacles" ? "Maze" : "Classic";

      li.innerHTML = `
        <span class="lb-rank">${RANK_ICONS[i] ?? i + 1}</span>
        <span class="lb-score">${e.score}</span>
        <span class="lb-meta">
          <span>${e.date ?? ""}</span>
          <span>${modeLabel}</span>
        </span>
        ${isNew ? '<span class="lb-new-badge">NEW</span>' : ""}
      `;
    } else {
      li.classList.add("lb-empty");
      li.innerHTML = `<span class="lb-rank">${RANK_ICONS[i] ?? i + 1}</span><span>—</span>`;
    }

    leaderboardList.appendChild(li);
  }
}

/** Opens the leaderboard modal (pass newIndex=-1 when just browsing). */
function openLeaderboard(newIndex = -1) {
  const entries = newIndex >= 0
    ? (() => {
        // Already submitted; just reload from storage
        return loadLeaderboard();
      })()
    : loadLeaderboard();

  renderLeaderboard(entries, newIndex);
  leaderboardModal.hidden = false;
}

function closeLeaderboard() {
  leaderboardModal.hidden = true;
}

// Trigger canvas screen shake effect
function triggerScreenShake() {
  canvas.classList.remove("shake");
  // Force DOM reflow to allow re-triggering the CSS keyframe animation
  void canvas.offsetWidth;
  canvas.classList.add("shake");

  canvas.addEventListener(
    "animationend",
    () => {
      canvas.classList.remove("shake");
    },
    { once: true },
  );
}

// Obstacle generation for Obstacle Maze mode
function generateObstacles() {
  obstacles = [];
  if (gameMode !== "obstacles") return;

  // Generate 4-6 small obstacle walls/blocks (each 2-4 tiles long)
  // Ensure obstacles do not spawn too close to initial snake (x: 4..10, y: 13..17)
  const blockCount = 5;
  for (let b = 0; b < blockCount; b++) {
    const isHorizontal = Math.random() < 0.5;
    const length = 3;
    const startX = Math.floor(Math.random() * (TILE_COUNT - length));
    const startY = Math.floor(Math.random() * (TILE_COUNT - length));

    for (let i = 0; i < length; i++) {
      const ox = isHorizontal ? startX + i : startX;
      const oy = isHorizontal ? startY : startY + i;

      // Keep safe zone around initial snake spawn (x: 4..9, y: 13..17)
      if (ox >= 3 && ox <= 9 && oy >= 13 && oy <= 17) {
        continue;
      }

      if (!obstacles.some((o) => o.x === ox && o.y === oy)) {
        obstacles.push({ x: ox, y: oy });
      }
    }
  }
}

// Active Buff UI Management
function startBuff(type, name, icon, durationMs) {
  activeBuff = {
    type,
    name,
    icon,
    duration: durationMs,
    expiresAt: Date.now() + durationMs,
    remaining: durationMs,
  };

  buffIcon.textContent = icon;
  buffTitle.textContent = name;
  buffTimer.textContent = `${(durationMs / 1000).toFixed(1)}s`;
  buffProgressFill.style.width = "100%";
  buffBarContainer.hidden = false;
}

function clearBuff() {
  activeBuff = null;
  if (buffBarContainer) {
    buffBarContainer.hidden = true;
  }
}

function updateBuffUI() {
  if (!activeBuff) {
    if (buffBarContainer && !buffBarContainer.hidden) {
      buffBarContainer.hidden = true;
    }
    return;
  }

  const remainingMs = Math.max(0, activeBuff.expiresAt - Date.now());
  activeBuff.remaining = remainingMs;

  const seconds = (remainingMs / 1000).toFixed(1);
  buffTimer.textContent = `${seconds}s`;

  const percent = Math.max(0, Math.min(100, (remainingMs / activeBuff.duration) * 100));
  buffProgressFill.style.width = `${percent}%`;

  if (remainingMs <= 0) {
    clearBuff();
  }
}

// 6. Initialize Game
function initGame() {
  canvas.classList.remove("shake");
  gameMode = gameModeSelect ? gameModeSelect.value : "classic";
  clearBuff();

  snake = [
    { x: 7, y: 15 },
    { x: 6, y: 15 },
    { x: 5, y: 15 },
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  score = 0;
  level = 1;
  normalFoodEaten = 0;
  specialFood = null;

  particles = [];
  floatingTexts = [];

  generateObstacles();

  currentSpeed = DIFFICULTIES[difficultySelect.value];

  spawnFood();
  updateDashboard();
  drawGame();

  gameState = "ready";
  updateStatus("READY TO PLAY");

  pauseButton.disabled = true;
  pauseButton.textContent = "PAUSE";

  const modeDescriptions = {
    classic: "Classic mode: Watch the walls and grow your snake!",
    portal: "Portal mode: Walk through edges to wrap around the screen!",
    obstacles: "Obstacle Maze: Navigate carefully around hazardous barriers!",
  };

  showOverlay(
    "🐍",
    "Ready to Play?",
    modeDescriptions[gameMode] || "Eat the food, collect special bonuses, and beat your high score!",
    "START GAME",
  );
}

// 7. Update Dashboard
function updateDashboard() {
  scoreElement.textContent = score;
  bestScoreElement.textContent = bestScore;
  levelElement.textContent = level;
}

// 8. Update Game Status
function updateStatus(message) {
  statusElement.textContent = message;
}

// 9. Show Overlay
function showOverlay(icon, title, message, buttonText) {
  overlayIcon.textContent = icon;
  overlayTitle.textContent = title;
  overlayMessage.textContent = message;
  startButton.textContent = buttonText;

  overlay.hidden = false;
}

// 10. Hide Overlay
function hideOverlay() {
  overlay.hidden = true;
}

// 11. Check Whether a Cell Is Occupied
function isCellOccupied(x, y) {
  const occupiedBySnake = snake.some(
    (segment) => segment.x === x && segment.y === y,
  );

  const occupiedByFood = food && food.x === x && food.y === y;

  const occupiedBySpecialFood =
    specialFood && specialFood.x === x && specialFood.y === y;

  const occupiedByObstacle = obstacles.some(
    (obs) => obs.x === x && obs.y === y,
  );

  return occupiedBySnake || occupiedByFood || occupiedBySpecialFood || occupiedByObstacle;
}

// 12. Get a Random Empty Cell
function getRandomEmptyCell() {
  const emptyCells = [];

  for (let y = 0; y < TILE_COUNT; y++) {
    for (let x = 0; x < TILE_COUNT; x++) {
      if (!isCellOccupied(x, y)) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);

  return emptyCells[randomIndex];
}

// 13. Spawn Normal Food
function spawnFood() {
  const emptyCell = getRandomEmptyCell();

  if (!emptyCell) {
    winGame();
    return;
  }

  food = emptyCell;
}

// 14. Spawn Special Food
function spawnSpecialFood() {
  if (specialFood || gameState === "over") {
    return;
  }

  const emptyCell = getRandomEmptyCell();

  if (!emptyCell) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * SPECIAL_FOOD_TYPES.length);

  const selectedType = SPECIAL_FOOD_TYPES[randomIndex];

  specialFood = {
    ...selectedType,
    x: emptyCell.x,
    y: emptyCell.y,
    expiresAt: Date.now() + SPECIAL_FOOD_DURATION,
  };
}

// Helper: get active theme palette (falls back to neon-green defaults)
function getThemePalette() {
  const activeTheme =
    document.documentElement.getAttribute("data-theme") || "neon-green";
  const palette =
    (window.SNAKE_THEME && window.SNAKE_THEME[activeTheme]) ||
    (window.SNAKE_THEME && window.SNAKE_THEME["neon-green"]) ||
    {
      bg: "#0b1217",
      gridLine: "rgba(57, 255, 136, 0.055)",
      snake: { head: "#70ffab", body: "#39d978", shadow: "#39ff88" },
      food: "#ff5263",
    };
  return palette;
}

// 15. Draw Background
function drawBackground() {
  const palette = getThemePalette();

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border style hints mode: Portal mode gets cyan border
  if (gameMode === "portal") {
    ctx.strokeStyle = "rgba(98, 200, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  }

  ctx.strokeStyle = palette.gridLine;
  ctx.lineWidth = 1;

  for (let i = 0; i <= TILE_COUNT; i++) {
    const position = i * GRID_SIZE;

    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(canvas.width, position);
    ctx.stroke();
  }
}

// 15b. Draw Obstacles (Obstacle Maze mode)
function drawObstacles() {
  if (gameMode !== "obstacles" || obstacles.length === 0) return;

  obstacles.forEach((obs) => {
    const padding = 1.5;
    const x = obs.x * GRID_SIZE + padding;
    const y = obs.y * GRID_SIZE + padding;
    const size = GRID_SIZE - padding * 2;

    ctx.save();
    ctx.fillStyle = "#ff4757";
    ctx.shadowColor = "#ff4757";
    ctx.shadowBlur = 10;

    // Obstacle block with warning neon styling
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 4);
    ctx.fill();

    // Inner detail
    ctx.fillStyle = "#2f3542";
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3, size - 6, size - 6, 2);
    ctx.fill();

    ctx.restore();
  });
}

// 16. Draw Normal Food
function drawFood() {
  if (!food) return;

  const palette = getThemePalette();
  const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;

  ctx.save();

  ctx.shadowColor = palette.food;
  ctx.shadowBlur = 15;
  ctx.fillStyle = palette.food;

  ctx.beginPath();
  ctx.arc(centerX, centerY, GRID_SIZE * 0.34, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 17. Draw Special Food
function drawSpecialFood() {
  if (!specialFood) return;

  const centerX = specialFood.x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = specialFood.y * GRID_SIZE + GRID_SIZE / 2;

  const remainingSeconds = Math.max(
    0,
    Math.ceil((specialFood.expiresAt - Date.now()) / 1000),
  );

  const glowColor =
    specialFood.type === "golden"
      ? "#ffd166"
      : specialFood.type === "crystal"
        ? "#62c8ff"
        : "#ff7e5f"; // trimmer orange-red

  ctx.save();

  // Draw glowing background
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 18;
  ctx.fillStyle = glowColor;

  ctx.beginPath();
  ctx.arc(centerX, centerY, GRID_SIZE * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // Draw special food icon
  ctx.shadowBlur = 0;
  ctx.font = "15px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(specialFood.emoji, centerX, centerY);

  // Show remaining time
  ctx.font = "bold 10px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${remainingSeconds}s`, centerX, centerY + 17);

  ctx.restore();
}

// 18. Draw Snake
function drawSnake() {
  const palette = getThemePalette();

  snake.forEach((segment, index) => {
    const padding = 2;
    const x = segment.x * GRID_SIZE + padding;
    const y = segment.y * GRID_SIZE + padding;
    const size = GRID_SIZE - padding * 2;

    ctx.save();

    ctx.fillStyle = index === 0 ? palette.snake.head : palette.snake.body;

    if (index === 0) {
      ctx.shadowColor = palette.snake.shadow;
      ctx.shadowBlur = 12;
    }

    ctx.beginPath();
    ctx.roundRect(x, y, size, size, index === 0 ? 6 : 4);
    ctx.fill();

    // Draw eyes on the snake head
    if (index === 0) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#07110b";

      const eyeOffset = 5;
      const eyeRadius = 2;

      let eyes;

      if (direction.x === 1) {
        eyes = [
          [x + size - eyeOffset, y + 5],
          [x + size - eyeOffset, y + size - 5],
        ];
      } else if (direction.x === -1) {
        eyes = [
          [x + eyeOffset, y + 5],
          [x + eyeOffset, y + size - 5],
        ];
      } else if (direction.y === -1) {
        eyes = [
          [x + 5, y + eyeOffset],
          [x + size - 5, y + eyeOffset],
        ];
      } else {
        eyes = [
          [x + 5, y + size - eyeOffset],
          [x + size - 5, y + size - eyeOffset],
        ];
      }

      eyes.forEach(([eyeX, eyeY]) => {
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  });
}

// 19. Particle & Visual Effects System
function createFoodExplosion(x, y, color = "#ff5263", count = 14) {
  const centerX = x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = y * GRID_SIZE + GRID_SIZE / 2;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 3.8;
    const size = 2 + Math.random() * 3.5;
    const maxLife = 20 + Math.random() * 18;

    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      color,
      alpha: 1,
      life: maxLife,
      maxLife,
    });
  }
}

function createFloatingScore(x, y, text, color = "#39ff88") {
  const centerX = x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = y * GRID_SIZE + GRID_SIZE / 2;

  floatingTexts.push({
    x: centerX,
    y: centerY,
    text,
    color,
    alpha: 1,
    vy: -1.2,
    life: 35,
    maxLife: 35,
  });
}

function updateAndDrawEffects() {
  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.94; // slight drag
    p.vy *= 0.94;
    p.life--;
    p.alpha = Math.max(0, p.life / p.maxLife);

    if (p.life <= 0 || p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Update and draw floating texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy;
    ft.life--;
    ft.alpha = Math.max(0, ft.life / ft.maxLife);

    if (ft.life <= 0 || ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = ft.alpha;
    ctx.font = "bold 13px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 6;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}

// Render game static elements (background, obstacles, food, snake)
function renderStaticScene() {
  drawBackground();
  drawObstacles();
  drawFood();
  drawSpecialFood();
  drawSnake();
}

// 20. Start Animation Loop (60FPS requestAnimationFrame for silky smooth effects)
function startAnimationLoop() {
  if (animationFrameId !== null) return;

  function renderLoop() {
    updateBuffUI();
    renderStaticScene();
    updateAndDrawEffects();
    animationFrameId = requestAnimationFrame(renderLoop);
  }

  animationFrameId = requestAnimationFrame(renderLoop);
}

function stopAnimationLoop() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// 21. Draw Game
function drawGame() {
  renderStaticScene();
  updateAndDrawEffects();
}

// 22. Start Game
function startGame() {
  if (gameState === "playing") return;

  if (gameState === "ready" || gameState === "over") {
    initGame();
  }

  hideOverlay();

  gameState = "playing";
  updateStatus("PLAYING");

  pauseButton.disabled = false;
  pauseButton.textContent = "PAUSE";

  runGameLoop();
  startAnimationLoop();
}

// 23. Game Loop
function runGameLoop() {
  clearInterval(gameLoop);

  gameLoop = setInterval(() => {
    if (gameState !== "playing") return;

    updateGame();
    // In case requestAnimationFrame is throttled in background, drawGame ensures update
    if (animationFrameId === null) {
      drawGame();
    }
  }, currentSpeed);
}

// 22. Update Snake Position
function updateGame() {
  // Remove expired special food
  if (specialFood && Date.now() >= specialFood.expiresAt) {
    specialFood = null;
  }
  if (statusElement.textContent.includes("BONUS") || statusElement.textContent.includes("TRIMMED")) {
    updateStatus("PLAYING");
  }
  direction = { ...nextDirection };

  let head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  // Boundary logic based on gameMode
  if (gameMode === "portal") {
    // Portal / Wrap-around mode: wraps around borders
    if (head.x < 0) head.x = TILE_COUNT - 1;
    else if (head.x >= TILE_COUNT) head.x = 0;
    if (head.y < 0) head.y = TILE_COUNT - 1;
    else if (head.y >= TILE_COUNT) head.y = 0;
  } else {
    // Classic & Obstacles: hitting boundary walls ends the game
    const hitWall =
      head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT;

    if (hitWall) {
      endGame();
      return;
    }
  }

  // Check obstacle collision in Obstacle Maze mode
  if (gameMode === "obstacles") {
    const hitObstacle = obstacles.some(
      (obs) => obs.x === head.x && obs.y === head.y,
    );

    if (hitObstacle) {
      endGame();
      return;
    }
  }

  const eatingFood = food && head.x === food.x && head.y === food.y;

  const eatingSpecialFood =
    specialFood && head.x === specialFood.x && head.y === specialFood.y;

  // The tail moves away unless the snake eats something.
  const bodyToCheck =
    eatingFood || eatingSpecialFood ? snake : snake.slice(0, -1);

  const hitSelf = bodyToCheck.some(
    (segment) => segment.x === head.x && segment.y === head.y,
  );

  if (hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (eatingFood) {
    eatFood();
  } else if (eatingSpecialFood) {
    eatSpecialFood();
  } else {
    snake.pop();
  }
}

// 23. Update Score, Level and Best Score
function addScore(points) {
  score += points;

  const newLevel = Math.floor(score / LEVEL_SCORE) + 1;

  if (newLevel > level) {
    level = newLevel;
  }

  if (score > bestScore) {
    bestScore = score;
    saveBestScore();
  }

  updateDashboard();

  // Increase speed as the level rises.
  const baseSpeed = DIFFICULTIES[difficultySelect.value];
  const newSpeed = Math.max(45, baseSpeed - (level - 1) * 8);

  if (newSpeed !== currentSpeed) {
    currentSpeed = newSpeed;

    if (gameState === "playing") {
      runGameLoop();
    }
  }
}

// 25. Eat Normal Food
function eatFood() {
  if (food) {
    createFoodExplosion(food.x, food.y, "#ff5263", 14);
    createFloatingScore(food.x, food.y, `+${FOOD_SCORE}`, "#ff5263");
  }

  addScore(FOOD_SCORE);

  normalFoodEaten++;

  spawnFood();

  // Every third normal food has a chance to spawn a bonus.
  if (
    normalFoodEaten % SPECIAL_FOOD_INTERVAL === 0 &&
    !specialFood &&
    Math.random() < SPECIAL_FOOD_CHANCE &&
    gameState !== "over"
  ) {
    spawnSpecialFood();
  }
}

// 26. Eat Special Food
function eatSpecialFood() {
  const points = specialFood.points;
  const foodType = specialFood.type;
  const foodX = specialFood.x;
  const foodY = specialFood.y;

  const burstColor =
    foodType === "golden"
      ? "#ffd166"
      : foodType === "crystal"
        ? "#62c8ff"
        : "#ff7e5f";

  createFoodExplosion(foodX, foodY, burstColor, 20);

  // If Tail Trimmer power-up was eaten
  if (foodType === "trimmer") {
    // Halve the snake's tail length (minimum 3 segments)
    const originalLength = snake.length;
    const newLength = Math.max(3, Math.floor(originalLength / 2));
    const trimmedCount = originalLength - newLength;

    if (trimmedCount > 0) {
      // Create burst particles along the trimmed segments
      for (let i = newLength; i < originalLength; i++) {
        createFoodExplosion(snake[i].x, snake[i].y, "#ff7e5f", 6);
      }
      snake = snake.slice(0, newLength);
    }

    createFloatingScore(foodX, foodY, `TRIM -${trimmedCount}!`, "#ff7e5f");
    startBuff("trimmer", "Tail Trimmer (-50% Length)", "✂️", 5000);
    updateStatus(`✂️ TAIL TRIMMED! -${trimmedCount} SEGMENTS`);
  } else {
    createFloatingScore(foodX, foodY, `+${points}`, burstColor);

    if (foodType === "golden") {
      updateStatus(`GOLDEN BONUS +${points}`);
    } else {
      updateStatus(`CRYSTAL BONUS +${points}`);
    }
  }

  // Remove the special food immediately.
  specialFood = null;

  addScore(points);
}

// 27. Pause / Resume
function togglePause() {
  if (gameState === "playing") {
    gameState = "paused";

    clearInterval(gameLoop);
    gameLoop = null;
    stopAnimationLoop();

    updateStatus("PAUSED");
    pauseButton.textContent = "RESUME";

    showOverlay(
      "⏸️",
      "Game Paused",
      "Take a break. Your snake is waiting!",
      "RESUME GAME",
    );

    return;
  }

  if (gameState === "paused") {
    startGame();
  }
}

// 28. Game Over — submit score then show leaderboard modal
function endGame() {
  clearInterval(gameLoop);
  gameLoop = null;
  stopAnimationLoop();

  gameState = "over";

  triggerScreenShake();

  updateStatus("GAME OVER");

  pauseButton.disabled = true;
  pauseButton.textContent = "PAUSE";

  // Submit to leaderboard, then open the modal after a short delay
  // (let shake finish before showing the modal)
  const { entries, newIndex } = submitScore(score);

  setTimeout(() => {
    renderLeaderboard(entries, newIndex);
    leaderboardModal.hidden = false;
  }, 450);
}

// 29. Win Game — also submit and show leaderboard
function winGame() {
  clearInterval(gameLoop);
  gameLoop = null;
  stopAnimationLoop();

  gameState = "over";

  updateStatus("YOU WIN!");

  pauseButton.disabled = true;
  pauseButton.textContent = "PAUSE";

  showOverlay(
    "🏆",
    "You Win!",
    `Amazing! You scored ${score} points and filled the board!`,
    "PLAY AGAIN",
  );

  // Submit score to leaderboard and open after a delay
  const { entries, newIndex } = submitScore(score);

  setTimeout(() => {
    renderLeaderboard(entries, newIndex);
    leaderboardModal.hidden = false;
  }, 800);
}

// 30. Restart Game
function restartGame() {
  clearInterval(gameLoop);
  gameLoop = null;
  stopAnimationLoop();
  closeLeaderboard();

  initGame();
}

// 31. Change Direction
function changeDirection(x, y) {
  if (gameState !== "playing") return;

  // Prevent the snake from reversing directly.
  if (x === -direction.x && y === -direction.y) {
    return;
  }

  nextDirection = { x, y };
}

// 32. Keyboard Controls
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  // Close leaderboard on Escape
  if (key === "escape" && !leaderboardModal.hidden) {
    closeLeaderboard();
    return;
  }

  const movementKeys = [
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "w",
    "a",
    "s",
    "d",
    " ",
  ];

  if (movementKeys.includes(key)) {
    event.preventDefault();
  }

  switch (key) {
    case "arrowup":
    case "w":
      changeDirection(0, -1);
      break;

    case "arrowdown":
    case "s":
      changeDirection(0, 1);
      break;

    case "arrowleft":
    case "a":
      changeDirection(-1, 0);
      break;

    case "arrowright":
    case "d":
      changeDirection(1, 0);
      break;

    case " ":
      togglePause();
      break;

    case "enter":
      if (
        gameState === "ready" ||
        gameState === "over" ||
        gameState === "paused"
      ) {
        startGame();
      }
      break;
  }
});

// 33. Button Events
startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", restartGame);

// Leaderboard modal controls
if (leaderboardBtn) {
  leaderboardBtn.addEventListener("click", () => {
    openLeaderboard(-1);
  });
}

if (lbCloseBtn) {
  lbCloseBtn.addEventListener("click", closeLeaderboard);
}

if (lbPlayAgainBtn) {
  lbPlayAgainBtn.addEventListener("click", () => {
    closeLeaderboard();
    // If game is over, restart; otherwise just close
    if (gameState === "over") {
      restartGame();
    }
  });
}

// Close modal when clicking the backdrop itself
if (leaderboardModal) {
  leaderboardModal.addEventListener("click", (e) => {
    if (e.target === leaderboardModal) {
      closeLeaderboard();
    }
  });
}

// 34. Difficulty & Game Mode Selection
difficultySelect.addEventListener("change", () => {
  const baseSpeed = DIFFICULTIES[difficultySelect.value];

  currentSpeed = Math.max(45, baseSpeed - (level - 1) * 8);

  if (gameState === "playing") {
    runGameLoop();
  }
});

if (gameModeSelect) {
  gameModeSelect.addEventListener("change", () => {
    gameMode = gameModeSelect.value;
    if (gameState === "ready" || gameState === "over" || gameState === "paused") {
      initGame();
    } else if (gameState === "playing") {
      generateObstacles();
      drawGame();
    }
  });
}

// 35. Initial Setup
bestScoreElement.textContent = bestScore;
initGame();
