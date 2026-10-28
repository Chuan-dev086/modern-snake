/* ========================================
   Modern Snake Game
   Special Food & Bonus Rewards | Phase 2 Modes | Phase 4 Leaderboard
   Refactored for Edge-Case Safety & Modularity
======================================== */

// --- MODULE: DOM Elements ---
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

const leaderboardModal = document.getElementById("leaderboard-modal");
const leaderboardList = document.getElementById("leaderboard-list");
const lbCloseBtn = document.getElementById("lb-close-btn");
const lbPlayAgainBtn = document.getElementById("lb-play-again-btn");

// --- MODULE: Game Configuration ---
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

const FOOD_SCORE = 10;
const LEVEL_SCORE = 50;

const SPECIAL_FOOD_INTERVAL = 3;
const SPECIAL_FOOD_CHANCE = 0.7;
const SPECIAL_FOOD_DURATION = 6000;

const SPECIAL_FOOD_TYPES = [
  { type: "golden", emoji: "⭐", points: 30 },
  { type: "crystal", emoji: "💎", points: 20 },
  { type: "trimmer", emoji: "✂️", points: 15 },
];

const DIFFICULTIES = { easy: 180, normal: 120, hard: 75 };

// --- MODULE: Game State ---
let snake = [];
let food = null;
let specialFood = null;
let obstacles = [];

let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

let score = 0;
let level = 1;
let bestScore = loadBestScore();
let normalFoodEaten = 0;
let gameState = "ready";
let gameLoop = null;
let currentSpeed = DIFFICULTIES.normal;
let gameMode = "classic";

// Active Buff / Power-up state
let activeBuff = null;

// Particle and Floating Text Systems
let particles = [];
let floatingTexts = [];
let animationFrameId = null;

// Pause Time Tracking (For freezing buffs/special food)
let pauseStartTime = 0;
let totalPausedTime = 0;

// --- MODULE: Persistence & Leaderboard ---
function loadBestScore() {
  try {
    const savedScore = Number(localStorage.getItem("modern_snake_best_score"));
    return Number.isFinite(savedScore) && savedScore >= 0 ? savedScore : 0;
  } catch (error) {
    console.warn("Unable to load best score:", error);
    return 0;
  }
}

function saveBestScore() {
  try {
    localStorage.setItem("modern_snake_best_score", String(bestScore));
  } catch (error) {
    console.warn("Unable to save best score:", error);
  }
}

const LEADERBOARD_KEY = "modern_snake_leaderboard";
const LEADERBOARD_MAX = 5;

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

function saveLeaderboard(entries) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (_) {}
}

function submitScore(newScore) {
  if (newScore <= 0) return { entries: loadLeaderboard(), newIndex: -1 };

  const entries = loadLeaderboard();
  const entry = {
    score: newScore,
    date: new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    mode: gameMode,
  };

  entries.push(entry);
  entries.sort((a, b) => b.score - a.score);

  const trimmed = entries.slice(0, LEADERBOARD_MAX);
  const newIndex = trimmed.findIndex((e) => e === entry);

  saveLeaderboard(trimmed);
  return { entries: trimmed, newIndex };
}

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
        e.mode === "portal"
          ? "Portal"
          : e.mode === "obstacles"
            ? "Maze"
            : "Classic";

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

function openLeaderboard(newIndex = -1) {
  const entries = loadLeaderboard();
  renderLeaderboard(entries, newIndex);
  leaderboardModal.hidden = false;
}

function closeLeaderboard() {
  leaderboardModal.hidden = true;
}

// --- MODULE: Core Game Logic ---
function triggerScreenShake() {
  canvas.classList.remove("shake");
  void canvas.offsetWidth; // Force reflow
  canvas.classList.add("shake");
  canvas.addEventListener(
    "animationend",
    () => canvas.classList.remove("shake"),
    { once: true },
  );
}

function generateObstacles() {
  obstacles = [];
  if (gameMode !== "obstacles") return;

  const blockCount = 5;
  for (let b = 0; b < blockCount; b++) {
    const isHorizontal = Math.random() < 0.5;
    const length = 3;
    const startX = Math.floor(Math.random() * (TILE_COUNT - length));
    const startY = Math.floor(Math.random() * (TILE_COUNT - length));

    for (let i = 0; i < length; i++) {
      const ox = isHorizontal ? startX + i : startX;
      const oy = isHorizontal ? startY : startY + i;

      if (ox >= 3 && ox <= 9 && oy >= 13 && oy <= 17) continue; // Safe zone

      if (!obstacles.some((o) => o.x === ox && o.y === oy)) {
        obstacles.push({ x: ox, y: oy });
      }
    }
  }
}

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
  if (buffBarContainer) buffBarContainer.hidden = true;
}

function updateBuffUI() {
  if (!activeBuff) {
    if (buffBarContainer && !buffBarContainer.hidden)
      buffBarContainer.hidden = true;
    return;
  }

  const remainingMs = Math.max(0, activeBuff.expiresAt - Date.now());
  activeBuff.remaining = remainingMs;
  buffTimer.textContent = `${(remainingMs / 1000).toFixed(1)}s`;
  const percent = Math.max(
    0,
    Math.min(100, (remainingMs / activeBuff.duration) * 100),
  );
  buffProgressFill.style.width = `${percent}%`;

  if (remainingMs <= 0) clearBuff();
}

function initGame() {
  canvas.classList.remove("shake");
  gameMode = gameModeSelect ? gameModeSelect.value : "classic";
  clearBuff();

  // Reset pause timers
  pauseStartTime = 0;
  totalPausedTime = 0;

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
    modeDescriptions[gameMode] ||
      "Eat the food, collect special bonuses, and beat your high score!",
    "START GAME",
  );
}

function updateDashboard() {
  scoreElement.textContent = score;
  bestScoreElement.textContent = bestScore;
  levelElement.textContent = level;
}

function updateStatus(message) {
  statusElement.textContent = message;
}

function showOverlay(icon, title, message, buttonText) {
  overlayIcon.textContent = icon;
  overlayTitle.textContent = title;
  overlayMessage.textContent = message;
  startButton.textContent = buttonText;
  overlay.hidden = false;
}

function hideOverlay() {
  overlay.hidden = true;
}

// 【边缘情况修复】：增加 predictNextStep 参数，防止食物生成在蛇头下一步的必经之路上
function isCellOccupied(x, y, predictNextStep = false) {
  const occupiedBySnake = snake.some(
    (segment) => segment.x === x && segment.y === y,
  );
  const occupiedByFood = food && food.x === x && food.y === y;
  const occupiedBySpecialFood =
    specialFood && specialFood.x === x && specialFood.y === y;
  const occupiedByObstacle = obstacles.some(
    (obs) => obs.x === x && obs.y === y,
  );

  if (predictNextStep && snake.length > 0) {
    const nextHeadX = snake[0].x + direction.x;
    const nextHeadY = snake[0].y + direction.y;
    if (x === nextHeadX && y === nextHeadY) return true;
  }

  return (
    occupiedBySnake ||
    occupiedByFood ||
    occupiedBySpecialFood ||
    occupiedByObstacle
  );
}

function getRandomEmptyCell() {
  const emptyCells = [];
  for (let y = 0; y < TILE_COUNT; y++) {
    for (let x = 0; x < TILE_COUNT; x++) {
      // 传入 true 启用下一步预测检查
      if (!isCellOccupied(x, y, true)) {
        emptyCells.push({ x, y });
      }
    }
  }
  if (emptyCells.length === 0) return null;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function spawnFood() {
  const emptyCell = getRandomEmptyCell();
  if (!emptyCell) {
    winGame();
    return;
  }
  food = emptyCell;
}

function spawnSpecialFood() {
  if (specialFood || gameState === "over") return;
  const emptyCell = getRandomEmptyCell();
  if (!emptyCell) return;

  const selectedType =
    SPECIAL_FOOD_TYPES[Math.floor(Math.random() * SPECIAL_FOOD_TYPES.length)];
  specialFood = {
    ...selectedType,
    x: emptyCell.x,
    y: emptyCell.y,
    expiresAt: Date.now() + SPECIAL_FOOD_DURATION,
  };
}

function getThemePalette() {
  const activeTheme =
    document.documentElement.getAttribute("data-theme") || "neon-green";
  return (
    (window.SNAKE_THEME && window.SNAKE_THEME[activeTheme]) ||
    (window.SNAKE_THEME && window.SNAKE_THEME["neon-green"]) || {
      bg: "#0b1217",
      gridLine: "rgba(57, 255, 136, 0.055)",
      snake: { head: "#70ffab", body: "#39d978", shadow: "#39ff88" },
      food: "#ff5263",
    }
  );
}

// --- MODULE: Renderer ---
function drawBackground() {
  const palette = getThemePalette();
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 4);
    ctx.fill();
    ctx.fillStyle = "#2f3542";
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3, size - 6, size - 6, 2);
    ctx.fill();
    ctx.restore();
  });
}

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
        : "#ff7e5f";

  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 18;
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, GRID_SIZE * 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.font = "15px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(specialFood.emoji, centerX, centerY);

  ctx.font = "bold 10px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${remainingSeconds}s`, centerX, centerY + 17);
  ctx.restore();
}

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

    if (index === 0) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#07110b";
      const eyeOffset = 5;
      const eyeRadius = 2;
      let eyes;
      if (direction.x === 1)
        eyes = [
          [x + size - eyeOffset, y + 5],
          [x + size - eyeOffset, y + size - 5],
        ];
      else if (direction.x === -1)
        eyes = [
          [x + eyeOffset, y + 5],
          [x + eyeOffset, y + size - 5],
        ];
      else if (direction.y === -1)
        eyes = [
          [x + 5, y + eyeOffset],
          [x + size - 5, y + eyeOffset],
        ];
      else
        eyes = [
          [x + 5, y + size - eyeOffset],
          [x + size - 5, y + size - eyeOffset],
        ];

      eyes.forEach(([eyeX, eyeY]) => {
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();
  });
}

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
  floatingTexts.push({
    x: x * GRID_SIZE + GRID_SIZE / 2,
    y: y * GRID_SIZE + GRID_SIZE / 2,
    text,
    color,
    alpha: 1,
    vy: -1.2,
    life: 35,
    maxLife: 35,
  });
}

function updateAndDrawEffects() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.94;
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

function renderStaticScene() {
  drawBackground();
  drawObstacles();
  drawFood();
  drawSpecialFood();
  drawSnake();
}

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

function drawGame() {
  renderStaticScene();
  updateAndDrawEffects();
}

// --- MODULE: Game Loop & Controls ---
function startGame() {
  if (gameState === "playing") return;
  if (gameState === "ready" || gameState === "over") initGame();

  hideOverlay();
  gameState = "playing";
  updateStatus("PLAYING");
  pauseButton.disabled = false;
  pauseButton.textContent = "PAUSE";
  runGameLoop();
  startAnimationLoop();
}

function runGameLoop() {
  clearInterval(gameLoop);
  gameLoop = setInterval(() => {
    if (gameState !== "playing") return;
    updateGame();
    if (animationFrameId === null) drawGame();
  }, currentSpeed);
}

function updateGame() {
  if (specialFood && Date.now() >= specialFood.expiresAt) specialFood = null;

  if (
    statusElement.textContent.includes("BONUS") ||
    statusElement.textContent.includes("TRIMMED")
  ) {
    updateStatus("PLAYING");
  }

  direction = { ...nextDirection };
  let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (gameMode === "portal") {
    if (head.x < 0) head.x = TILE_COUNT - 1;
    else if (head.x >= TILE_COUNT) head.x = 0;
    if (head.y < 0) head.y = TILE_COUNT - 1;
    else if (head.y >= TILE_COUNT) head.y = 0;
  } else {
    if (
      head.x < 0 ||
      head.x >= TILE_COUNT ||
      head.y < 0 ||
      head.y >= TILE_COUNT
    ) {
      endGame();
      return;
    }
  }

  if (gameMode === "obstacles") {
    if (obstacles.some((obs) => obs.x === head.x && obs.y === head.y)) {
      endGame();
      return;
    }
  }

  const eatingFood = food && head.x === food.x && head.y === food.y;
  const eatingSpecialFood =
    specialFood && head.x === specialFood.x && head.y === specialFood.y;
  const bodyToCheck =
    eatingFood || eatingSpecialFood ? snake : snake.slice(0, -1);

  if (
    bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y)
  ) {
    endGame();
    return;
  }

  snake.unshift(head);
  if (eatingFood) eatFood();
  else if (eatingSpecialFood) eatSpecialFood();
  else snake.pop();
}

function addScore(points) {
  score += points;
  const newLevel = Math.floor(score / LEVEL_SCORE) + 1;
  if (newLevel > level) level = newLevel;

  if (score > bestScore) {
    bestScore = score;
    saveBestScore();
  }
  updateDashboard();

  const baseSpeed = DIFFICULTIES[difficultySelect.value];
  const newSpeed = Math.max(45, baseSpeed - (level - 1) * 8);
  if (newSpeed !== currentSpeed) {
    currentSpeed = newSpeed;
    if (gameState === "playing") runGameLoop();
  }
}

function eatFood() {
  if (food) {
    createFoodExplosion(food.x, food.y, "#ff5263", 14);
    createFloatingScore(food.x, food.y, `+${FOOD_SCORE}`, "#ff5263");
  }
  addScore(FOOD_SCORE);
  normalFoodEaten++;
  spawnFood();

  if (
    normalFoodEaten % SPECIAL_FOOD_INTERVAL === 0 &&
    !specialFood &&
    Math.random() < SPECIAL_FOOD_CHANCE &&
    gameState !== "over"
  ) {
    spawnSpecialFood();
  }
}

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

  if (foodType === "trimmer") {
    const originalLength = snake.length;
    const newLength = Math.max(3, Math.floor(originalLength / 2));
    const trimmedCount = originalLength - newLength;
    if (trimmedCount > 0) {
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
    updateStatus(
      foodType === "golden"
        ? `GOLDEN BONUS +${points}`
        : `CRYSTAL BONUS +${points}`,
    );
  }

  specialFood = null;
  addScore(points);
}

function togglePause() {
  if (gameState === "playing") {
    gameState = "paused";
    pauseStartTime = Date.now(); // 记录暂停开始时间
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
    const pauseDuration = Date.now() - pauseStartTime;
    totalPausedTime += pauseDuration;

    // 【边缘情况修复】：将特殊食物和 Buff 的过期时间向后顺延，实现真正的“时间冻结”
    if (specialFood) specialFood.expiresAt += pauseDuration;
    if (activeBuff) activeBuff.expiresAt += pauseDuration;

    startGame();
  }
}

function endGame() {
  clearInterval(gameLoop);
  gameLoop = null;
  stopAnimationLoop();
  gameState = "over";
  triggerScreenShake();
  updateStatus("GAME OVER");
  pauseButton.disabled = true;
  pauseButton.textContent = "PAUSE";

  const { entries, newIndex } = submitScore(score);
  setTimeout(() => {
    renderLeaderboard(entries, newIndex);
    leaderboardModal.hidden = false;
  }, 450);
}

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

  const { entries, newIndex } = submitScore(score);
  setTimeout(() => {
    renderLeaderboard(entries, newIndex);
    leaderboardModal.hidden = false;
  }, 800);
}

function restartGame() {
  clearInterval(gameLoop);
  gameLoop = null;
  stopAnimationLoop();
  closeLeaderboard();
  initGame();
}

function changeDirection(x, y) {
  if (gameState !== "playing") return;
  if (x === -direction.x && y === -direction.y) return;
  nextDirection = { x, y };
}

// --- MODULE: Event Listeners ---
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
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
  if (movementKeys.includes(key)) event.preventDefault();

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
      )
        startGame();
      break;
  }
});

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", restartGame);

if (leaderboardBtn)
  leaderboardBtn.addEventListener("click", () => openLeaderboard(-1));
if (lbCloseBtn) lbCloseBtn.addEventListener("click", closeLeaderboard);
if (lbPlayAgainBtn)
  lbPlayAgainBtn.addEventListener("click", () => {
    closeLeaderboard();
    if (gameState === "over") restartGame();
  });

if (leaderboardModal) {
  leaderboardModal.addEventListener("click", (e) => {
    if (e.target === leaderboardModal) closeLeaderboard();
  });
}

difficultySelect.addEventListener("change", () => {
  const baseSpeed = DIFFICULTIES[difficultySelect.value];
  currentSpeed = Math.max(45, baseSpeed - (level - 1) * 8);
  if (gameState === "playing") runGameLoop();
});

if (gameModeSelect) {
  gameModeSelect.addEventListener("change", () => {
    gameMode = gameModeSelect.value;
    if (
      gameState === "ready" ||
      gameState === "over" ||
      gameState === "paused"
    ) {
      initGame();
    } else if (gameState === "playing") {
      generateObstacles();
      drawGame();
    }
  });
}

// --- MODULE: Initialization ---
bestScoreElement.textContent = bestScore;
initGame();
