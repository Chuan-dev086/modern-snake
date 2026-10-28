/* ========================================
   Modern Snake Game - Renderer Module
   Handles all Canvas 2D drawing operations
======================================== */

import { GRID_SIZE } from "./config.js";

export function drawBackground(ctx, canvas, gameMode, palette) {
  const TILE_COUNT = canvas.width / GRID_SIZE;
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

export function drawObstacles(ctx, obstacles) {
  if (!obstacles || obstacles.length === 0) return;
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

export function drawFood(ctx, food, palette) {
  if (!food) return;
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

export function drawSpecialFood(ctx, specialFood) {
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

export function drawSnake(ctx, snake, direction, palette) {
  if (!snake) return;
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

export function updateAndDrawEffects(ctx, particles, floatingTexts) {
  // Update and draw particles
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

// 🌟 High-level render orchestrator
// This is the only function main.js needs to call to draw the entire frame
export function renderScene(ctx, canvas, state, getThemePalette) {
  const palette = getThemePalette();
  drawBackground(ctx, canvas, state.gameMode, palette);
  drawObstacles(ctx, state.obstacles);
  drawFood(ctx, state.food, palette);
  drawSpecialFood(ctx, state.specialFood);
  drawSnake(ctx, state.snake, state.direction, palette);
  updateAndDrawEffects(ctx, state.particles, state.floatingTexts);
}
