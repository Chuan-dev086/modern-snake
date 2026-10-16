// ========================================
// Modern Snake Game
// Core Game Logic
// ========================================

// 1. Get HTML Elements
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

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
const difficultySelect = document.getElementById("difficulty");

// 2. Game Configuration
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const FOOD_SCORE = 10;
const LEVEL_SCORE = 50;

const DIFFICULTIES = {
  easy: 180,
  normal: 120,
  hard: 75,
};

// 3. Game State
let snake;
let food;
let direction;
let nextDirection;

let score = 0;
let level = 1;
let bestScore = loadBestScore();

let gameState = "ready";
let gameLoop = null;
let currentSpeed = DIFFICULTIES.normal;

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

// 6. Initialize Game
function initGame() {
  snake = [
    { x: 7, y: 15 },
    { x: 6, y: 15 },
    { x: 5, y: 15 },
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  score = 0;
  level = 1;

  currentSpeed = DIFFICULTIES[difficultySelect.value];

  spawnFood();
  updateDashboard();
  drawGame();

  gameState = "ready";
  updateStatus("READY TO PLAY");

  pauseButton.disabled = true;
  pauseButton.textContent = "PAUSE";

  showOverlay(
    "🐍",
    "Ready to Play?",
    "Eat the food, grow your snake, and beat your high score!",
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

// 11. Spawn Food
function spawnFood() {
  const emptyCells = [];

  for (let y = 0; y < TILE_COUNT; y++) {
    for (let x = 0; x < TILE_COUNT; x++) {
      const occupied = snake.some(
        (segment) => segment.x === x && segment.y === y,
      );

      if (!occupied) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length === 0) {
    winGame();
    return;
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);

  food = emptyCells[randomIndex];
}

// 12. Draw Background
function drawBackground() {
  ctx.fillStyle = "#0b1217";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(57, 255, 136, 0.055)";
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

// 13. Draw Food
function drawFood() {
  if (!food) return;

  const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;

  ctx.save();

  ctx.shadowColor = "#ff5263";
  ctx.shadowBlur = 15;
  ctx.fillStyle = "#ff5263";

  ctx.beginPath();
  ctx.arc(centerX, centerY, GRID_SIZE * 0.34, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 14. Draw Snake
function drawSnake() {
  snake.forEach((segment, index) => {
    const padding = 2;

    const x = segment.x * GRID_SIZE + padding;
    const y = segment.y * GRID_SIZE + padding;
    const size = GRID_SIZE - padding * 2;

    ctx.save();

    ctx.fillStyle = index === 0 ? "#70ffab" : "#39d978";

    if (index === 0) {
      ctx.shadowColor = "#39ff88";
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

// 15. Draw Game
function drawGame() {
  drawBackground();
  drawFood();
  drawSnake();
}

// 16. Start Game
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
}

// 17. Game Loop
function runGameLoop() {
  clearInterval(gameLoop);

  gameLoop = setInterval(() => {
    if (gameState !== "playing") return;

    updateGame();
    drawGame();
  }, currentSpeed);
}

// 18. Update Snake Position
function updateGame() {
  direction = { ...nextDirection };

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  // Check wall collision
  const hitWall =
    head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT;

  if (hitWall) {
    endGame();
    return;
  }

  const eatingFood = head.x === food.x && head.y === food.y;

  // When not eating, the tail moves away this turn.
  // Therefore, the new head may enter the old tail cell.
  const bodyToCheck = eatingFood ? snake : snake.slice(0, -1);

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
  } else {
    snake.pop();
  }
}

// 19. Eat Food
function eatFood() {
  score += FOOD_SCORE;

  const newLevel = Math.floor(score / LEVEL_SCORE) + 1;

  if (newLevel > level) {
    level = newLevel;
  }

  if (score > bestScore) {
    bestScore = score;
    saveBestScore();
  }

  updateDashboard();

  // Increase speed when the level rises.
  const baseSpeed = DIFFICULTIES[difficultySelect.value];
  const newSpeed = Math.max(45, baseSpeed - (level - 1) * 8);

  if (newSpeed !== currentSpeed) {
    currentSpeed = newSpeed;
    runGameLoop();
  }

  spawnFood();
}

// 20. Pause / Resume
function togglePause() {
  if (gameState === "playing") {
    gameState = "paused";

    clearInterval(gameLoop);
    gameLoop = null;

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

// 21. Game Over
function endGame() {
  clearInterval(gameLoop);
  gameLoop = null;

  gameState = "over";

  updateStatus("GAME OVER");

  pauseButton.disabled = true;
  pauseButton.textContent = "PAUSE";

  showOverlay(
    "💥",
    "Game Over!",
    `Your score: ${score}. ${score >= bestScore ? "Great job!" : "Try again and beat your best!"}`,
    "PLAY AGAIN",
  );
}

// 22. Win Game
function winGame() {
  clearInterval(gameLoop);
  gameLoop = null;

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
}

// 23. Restart Game
function restartGame() {
  clearInterval(gameLoop);
  gameLoop = null;

  initGame();
}

// 24. Change Direction
function changeDirection(x, y) {
  if (gameState !== "playing") return;

  // Prevent the snake from reversing directly.
  if (x === -direction.x && y === -direction.y) {
    return;
  }

  nextDirection = { x, y };
}

// 25. Keyboard Controls
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

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
      if (gameState === "ready" || gameState === "over") {
        startGame();
      } else if (gameState === "paused") {
        startGame();
      }
      break;
  }
});

// 26. Button Events
startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", restartGame);

// 27. Difficulty Selection
difficultySelect.addEventListener("change", () => {
  currentSpeed = DIFFICULTIES[difficultySelect.value];

  if (gameState === "playing") {
    runGameLoop();
  }
});

// 28. Initial Setup
bestScoreElement.textContent = bestScore;
initGame();
