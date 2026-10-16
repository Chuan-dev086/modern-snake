/* ========================================
   Modern Snake Game
   Special Food & Bonus Rewards
======================================== */

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

let direction;
let nextDirection;

let score = 0;
let level = 1;
let bestScore = loadBestScore();

let normalFoodEaten = 0;
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
  normalFoodEaten = 0;
  specialFood = null;

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
    "Eat the food, collect special bonuses, and beat your high score!",
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

  return occupiedBySnake || occupiedByFood || occupiedBySpecialFood;
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

// 15. Draw Background
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

// 16. Draw Normal Food
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

// 17. Draw Special Food
function drawSpecialFood() {
  if (!specialFood) return;

  const centerX = specialFood.x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = specialFood.y * GRID_SIZE + GRID_SIZE / 2;

  const remainingSeconds = Math.max(
    0,
    Math.ceil((specialFood.expiresAt - Date.now()) / 1000),
  );

  const glowColor = specialFood.type === "golden" ? "#ffd166" : "#62c8ff";

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

// 19. Draw Game
function drawGame() {
  drawBackground();
  drawFood();
  drawSpecialFood();
  drawSnake();
}

// 20. Start Game
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

// 21. Game Loop
function runGameLoop() {
  clearInterval(gameLoop);

  gameLoop = setInterval(() => {
    if (gameState !== "playing") return;

    updateGame();
    drawGame();
  }, currentSpeed);
}

// 22. Update Snake Position
function updateGame() {
  // Remove expired special food
  if (specialFood && Date.now() >= specialFood.expiresAt) {
    specialFood = null;
  }
  if (statusElement.textContent.includes("BONUS")) {
    updateStatus("PLAYING");
  }
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

// 24. Eat Normal Food
function eatFood() {
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

// 25. Eat Special Food
function eatSpecialFood() {
  const points = specialFood.points;
  const foodType = specialFood.type;

  // Remove the special food immediately.
  specialFood = null;

  addScore(points);

  // Show a brief reward message in the game status.
  if (foodType === "golden") {
    updateStatus(`GOLDEN BONUS +${points}`);
  } else {
    updateStatus(`CRYSTAL BONUS +${points}`);
  }

  // Return to the normal status on the next game tick.
  // The snake grows because its tail is not removed this turn.
}

// 26. Pause / Resume
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

// 27. Game Over
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
    `Your score: ${score}. ${
      score >= bestScore ? "Great job!" : "Try again and beat your best!"
    }`,
    "PLAY AGAIN",
  );
}

// 28. Win Game
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

// 29. Restart Game
function restartGame() {
  clearInterval(gameLoop);
  gameLoop = null;

  initGame();
}

// 30. Change Direction
function changeDirection(x, y) {
  if (gameState !== "playing") return;

  // Prevent the snake from reversing directly.
  if (x === -direction.x && y === -direction.y) {
    return;
  }

  nextDirection = { x, y };
}

// 31. Keyboard Controls
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

// 32. Button Events
startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", restartGame);

// 33. Difficulty Selection
difficultySelect.addEventListener("change", () => {
  const baseSpeed = DIFFICULTIES[difficultySelect.value];

  currentSpeed = Math.max(45, baseSpeed - (level - 1) * 8);

  if (gameState === "playing") {
    runGameLoop();
  }
});

// 34. Initial Setup
bestScoreElement.textContent = bestScore;
initGame();
