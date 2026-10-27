# 🐍 Modern Snake Game

**English** | [简体中文](./README.md)

A modern Snake game built with vanilla HTML, CSS, and JavaScript. It features a dark arcade-dashboard look, multiple game modes, special food, particle effects, a local leaderboard, and theme switching. No frameworks or build tools are needed — just open `index.html` and play.

## 📌 1. Project Overview

### Project Goals

- Learn practical HTML, CSS, and JavaScript.
- Understand Canvas drawing and the basics of a game loop.
- Learn keyboard event handling, game state management, and collision detection.
- Implement score, level, difficulty, game modes, and a leaderboard.
- Practice managing a project with Git, GitHub, and WSL.

### Technology Stack

| Technology              | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| HTML5                   | Page structure and UI layout                             |
| CSS3                    | Visual design, theme variables, animation, responsive UI |
| JavaScript (Vanilla JS) | Game logic and interaction                               |
| HTML Canvas             | Drawing the snake, food, obstacles, and particle effects |
| LocalStorage            | Saving the best score, leaderboard, and theme            |
| Git & GitHub            | Version control and project management                   |
| WSL + Ubuntu / VS Code  | Development environment                                  |

**Development Principles**

- No frontend frameworks such as React or Vue.
- No Vite, Node.js, or backend server required.
- Prefer vanilla JavaScript to understand the underlying logic.
- Finish the core game first, then add advanced features step by step.

---

## ✨ 2. Features

### Gameplay

- A 30 × 30 grid on a Canvas game area (600 × 600, 20px per cell).
- The snake cannot reverse directly, and food never spawns on the snake or on obstacles.
- The game ends when the snake hits a wall, itself, or an obstacle; filling the entire board wins the game.
- Each normal food gives +10 points, every 50 points raises the level, and a higher level makes the snake faster.

### Difficulty

| Difficulty | Base Speed (interval per step) |
| ---------- | ------------------------------ |
| Easy       | 180 ms                         |
| Normal     | 120 ms                         |
| Hard       | 75 ms                          |

Each level shortens the interval by 8 ms, down to a minimum of 45 ms.

### Game Modes

| Mode          | Description                                                                             |
| ------------- | --------------------------------------------------------------------------------------- |
| Classic       | Standard rules; hitting a wall ends the game                                            |
| Portal (Wrap) | Crossing an edge brings the snake out on the opposite side; the board has a cyan border |
| Obstacle Maze | Random obstacle blocks are generated; hitting one ends the game, as do the walls        |

### Special Food

After every 3 normal foods, there is a 70% chance that a special food appears for 6 seconds:

| Food       | Points | Effect                                                                             |
| ---------- | ------ | ---------------------------------------------------------------------------------- |
| ⭐ Golden  | +30    | High-value bonus                                                                   |
| 💎 Crystal | +20    | Medium bonus                                                                       |
| ✂️ Trimmer | +15    | Cuts the snake's length in half (keeping at least 3 segments) and shows a buff bar |

### Visual Effects

- Particle bursts and floating score text (+10, +30, etc.) when food is eaten.
- Screen shake on collision.
- Glowing snake head with direction-aware eyes.
- Respects the `prefers-reduced-motion` setting.

### Leaderboard

- A local Top 5 leaderboard recording score, date, and game mode.
- Opens automatically when the game ends; new records are highlighted with a `NEW` badge.
- Click `🏆 SCORES` at any time to view it; close it with `Esc` or by clicking the backdrop.

### Themes

Switch themes with the `🎨 THEME` button in the top right. Your choice is saved:

- 🟢 Neon Green (default)
- 🌸 Synthwave
- 🟩 GameBoy

---

## 📁 3. Project File Structure

```text
modern-snake/
├── index.html
├── README.md
├── README.en.md
├── PLAN.md
├── css/
│   └── index.css
└── js/
    ├── main.js
    └── theme.js
```

### File Responsibilities

| File            | Responsibility                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `index.html`    | Page structure: title, status, theme menu, score cards, buff bar, Canvas, overlay, instructions, control buttons, leaderboard modal                                |
| `css/index.css` | Dark theme and CSS variables, per-theme colors, card/button/modal styles, animation, responsive layout (including a `max-width: 600px` breakpoint)                 |
| `js/main.js`    | Core logic: game state, movement and collisions, food and special food, modes and obstacles, particle effects, leaderboard, keyboard and button events, best score |
| `js/theme.js`   | Theme switching, saving/loading the theme, and providing each theme's Canvas colors to `main.js` (`window.SNAKE_THEME`)                                            |

---

## ⌨️ 4. Controls

| Key           | Action                                           |
| ------------- | ------------------------------------------------ |
| Arrow Keys    | Change direction                                 |
| W / A / S / D | Alternative direction controls                   |
| Space         | Pause / resume                                   |
| Enter         | Start, resume, or restart after the game is over |
| Esc           | Close the leaderboard modal                      |

On-screen controls: `START GAME`, `PAUSE / RESUME`, `RESTART`, `🏆 SCORES`, plus the `MODE` and `DIFFICULTY` dropdowns.

---

## 💾 5. Data Persistence

All data is stored in the browser's `localStorage`. It is not synced across devices or browsers.

| Key                        | Content                           |
| -------------------------- | --------------------------------- |
| `modern_snake_best_score`  | All-time best score               |
| `modern_snake_leaderboard` | Top 5 entries (score, date, mode) |
| `modern_snake_theme`       | Currently selected theme          |

---

## 🧩 6. Game Logic Architecture

The game uses two cooperating loops:

- **Logic loop**: `setInterval` at the current speed; handles snake movement, collision detection, and eating food.
- **Render loop**: `requestAnimationFrame`; redraws the background, obstacles, food, snake, particles, and buff bar every frame.

The game states are `ready`, `playing`, `paused`, and `over`. Movement logic never runs while paused or after the game is over.

```text
initGame → wait for input → startGame
        ↓
   Logic loop: update position → wall / obstacle / self collision → ate food? → update score & speed
        ↓
   Render loop: draw the scene and effects
        ↓
   endGame / winGame → submit to leaderboard → show leaderboard
```

---

## 🛠️ 7. Development Roadmap

### Completed

- [x] Phase 1 — Project Setup
- [x] Phase 2 — UI Development (dark theme, stat cards, Canvas, control buttons, responsive layout)
- [x] Phase 3 — Core Gameplay (movement, food, collisions, growth, game-over logic)
- [x] Phase 4 — Game Management (start, pause, restart, difficulty, score, level, best score)
- [x] Special food and the Tail Trimmer buff
- [x] Game modes: Classic / Portal / Obstacle Maze
- [x] Particle bursts, floating text, and screen shake
- [x] Local Top 5 leaderboard
- [x] Theme switcher (Neon Green / Synthwave / GameBoy)

### Planned (see [PLAN.md](./PLAN.md))

- [ ] Web Audio sound effects and a mute toggle (`M` key)
- [ ] New power-ups: Snail (slow motion) and Speed Surge (double points)
- [ ] Touch swipe controls and a virtual D-pad
- [ ] A fourth theme: Amber Terminal
- [ ] Record difficulty in the leaderboard
- [ ] Achievement system
- [ ] Split `main.js` into multiple ES modules

---

## 🐞 8. Known Issues

- When the game ends, only the leaderboard appears and no game-over overlay is shown; after closing the modal, press Enter or click RESTART to play again.
- The Tail Trimmer buff bar is currently just a countdown display and has no actual effect.
- The special-food status message is overwritten by `PLAYING` on the next step, so it is barely visible.
- Special food and buff timers keep running while the game is paused.
- In Obstacle mode, obstacles can spawn directly in front of the snake's head; if you switch to this mode mid-game, they may spawn on the snake's body.

---

## 🧪 9. Testing Checklist

- [ ] The game loads normally with no unhandled console errors.
- [ ] The snake moves in all four directions and cannot reverse directly.
- [ ] Eating food grows the snake and updates score and level correctly.
- [ ] Food never spawns on the snake or on obstacles.
- [ ] Hitting a wall, itself, or an obstacle ends the game (crossing the edge in Portal mode does not).
- [ ] The snake stops moving when paused and runs normally after resuming.
- [ ] Restarting fully resets the game state.
- [ ] Difficulty and mode selections take effect.
- [ ] Special food disappears after 6 seconds, and all three types behave correctly.
- [ ] Best score, leaderboard, and theme persist after a page refresh.
- [ ] UI and Canvas colors are correct in all three themes.
- [ ] There is no horizontal scrolling or serious overflow at different screen sizes.

---

## 📦 10. Running the Project

This project uses vanilla HTML, CSS, and JavaScript. It does not require Node.js or any build tools.

### Option 1 — Open in Browser

Open `index.html` directly in your browser.

### Option 2 — VS Code Live Server

Open the project folder in VS Code and run it with a local preview tool such as Live Server.

### Option 3 — WSL Ubuntu

```bash
cd ~/projects/modern-snake
code .
```

Save your files and view the result in the browser.

---

## 📝 11. Project Status

**Current Stage:** Playable — the core gameplay, modes, leaderboard, and themes are complete; the project is now in polish and feature-expansion.

**Next Priority:** Fix the known issues, then implement sound effects and touch controls.

---

## 📄 License

Currently a personal learning project. If it is published or accepts contributions in the future, an appropriate open-source license can be chosen then.
