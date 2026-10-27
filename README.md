# 🐍 Modern Snake Game

[English](./README.en.md) | **简体中文**

一个使用原生 HTML、CSS 和 JavaScript 开发的现代化贪吃蛇游戏。项目采用深色 Arcade Dashboard 风格，支持多种游戏模式、特殊食物、粒子特效、本地排行榜和多主题切换，无需任何框架或构建工具，打开 `index.html` 即可游玩。

## 📌 1. Project Overview

### Project Goals

- 学习 HTML、CSS 和 JavaScript 的实际应用。
- 理解 Canvas 绘图与游戏循环的基本原理。
- 学习键盘事件、游戏状态管理和碰撞检测。
- 实现分数、等级、难度、模式与排行榜系统。
- 练习使用 Git、GitHub 和 WSL 管理项目。

### Technology Stack

| Technology              | Purpose                              |
| ----------------------- | ------------------------------------ |
| HTML5                   | 构建游戏页面与 UI 结构               |
| CSS3                    | 视觉设计、主题变量、动画和响应式样式 |
| JavaScript (Vanilla JS) | 游戏逻辑与交互                       |
| HTML Canvas             | 绘制蛇、食物、障碍物和粒子特效       |
| LocalStorage            | 保存最高分、排行榜和主题设置         |
| Git & GitHub            | 版本控制与项目管理                   |
| WSL + Ubuntu / VS Code  | 开发环境                             |

**Development Principles**

- 不使用 React、Vue 等前端框架。
- 不需要 Vite、Node.js 或后端服务器。
- 优先使用原生 JavaScript 理解底层逻辑。
- 先完成核心游戏，再逐步增加高级功能。

---

## ✨ 2. Features

### Gameplay

- 基于 30 × 30 网格的 Canvas 游戏区域（600 × 600，每格 20px）。
- 蛇不能直接反向移动，食物不会生成在蛇身或障碍物上。
- 撞墙、撞到自己或撞到障碍物时游戏结束；填满整个棋盘则获胜。
- 每吃一个普通食物 +10 分，每 50 分升一级，等级越高蛇移动越快。

### Difficulty

| Difficulty | Base Speed (每步间隔) |
| ---------- | --------------------- |
| Easy       | 180 ms                |
| Normal     | 120 ms                |
| Hard       | 75 ms                 |

每升一级间隔缩短 8 ms，最快不低于 45 ms。

### Game Modes

| Mode          | Description                                  |
| ------------- | -------------------------------------------- |
| Classic       | 标准规则，撞墙即结束                         |
| Portal (Wrap) | 穿过边界会从另一侧出现，棋盘边缘显示青色边框 |
| Obstacle Maze | 随机生成障碍方块，撞到即结束，撞墙同样结束   |

### Special Food

每吃 3 个普通食物，有 70% 概率生成一个限时 6 秒的特殊食物：

| Food       | Points | Effect                                        |
| ---------- | ------ | --------------------------------------------- |
| ⭐ Golden  | +30    | 高分奖励                                      |
| 💎 Crystal | +20    | 中等奖励                                      |
| ✂️ Trimmer | +15    | 蛇身缩短一半（最少保留 3 节），并显示 Buff 条 |

### Visual Effects

- 吃到食物时的粒子爆炸与飘字（+10、+30 等）。
- 撞击时的屏幕震动。
- 蛇头发光与朝向眼睛。
- 支持 `prefers-reduced-motion` 的减少动画设置。

### Leaderboard

- 本地 Top 5 排行榜，记录分数、日期和游戏模式。
- 游戏结束后自动弹出，新纪录会高亮并显示 `NEW` 标记。
- 也可随时点击 `🏆 SCORES` 查看，按 `Esc` 或点击背景关闭。

### Themes

通过右上角 `🎨 THEME` 切换，选择会被保存：

- 🟢 Neon Green（默认）
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

| File            | Responsibility                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| `index.html`    | 页面结构：标题、状态、主题菜单、分数卡片、Buff 条、Canvas、Overlay、操作说明、控制按钮、排行榜弹窗       |
| `css/index.css` | 深色主题与 CSS 变量、各主题配色、卡片/按钮/弹窗样式、动画、响应式布局（含 `max-width: 600px` 适配）      |
| `js/main.js`    | 核心逻辑：游戏状态、移动与碰撞、食物与特殊食物、模式与障碍、粒子特效、排行榜、键盘与按钮事件、最高分保存 |
| `js/theme.js`   | 主题切换、保存/读取主题，并向 `main.js` 提供各主题的 Canvas 配色（`window.SNAKE_THEME`）                 |

---

## ⌨️ 4. Controls

| Key           | Action                               |
| ------------- | ------------------------------------ |
| Arrow Keys    | 控制移动方向                         |
| W / A / S / D | 替代方向控制                         |
| Space         | 暂停 / 继续                          |
| Enter         | 开始游戏、继续游戏或在结束后重新开始 |
| Esc           | 关闭排行榜弹窗                       |

界面按钮：`START GAME`、`PAUSE / RESUME`、`RESTART`、`🏆 SCORES`，以及 `MODE` 和 `DIFFICULTY` 下拉选择。

---

## 💾 5. Data Persistence

所有数据保存在浏览器 `localStorage` 中，不会同步到其他设备或浏览器。

| Key                        | Content                        |
| -------------------------- | ------------------------------ |
| `modern_snake_best_score`  | 历史最高分                     |
| `modern_snake_leaderboard` | Top 5 记录（分数、日期、模式） |
| `modern_snake_theme`       | 当前选择的主题                 |

---

## 🧩 6. Game Logic Architecture

游戏采用两个循环配合：

- **逻辑循环**：`setInterval`，间隔等于当前速度，负责移动蛇、碰撞检测和吃食物。
- **渲染循环**：`requestAnimationFrame`，每帧重绘背景、障碍、食物、蛇、粒子和 Buff 条。

游戏状态为 `ready`、`playing`、`paused`、`over`，暂停和结束后不会继续执行移动逻辑。

```text
initGame → 等待输入 → startGame
        ↓
   逻辑循环：更新位置 → 边界 / 障碍 / 自身碰撞 → 吃食物？→ 更新分数与速度
        ↓
   渲染循环：绘制画面与特效
        ↓
   endGame / winGame → 提交排行榜 → 弹出排行榜
```

---

## 🛠️ 7. Development Roadmap

### Completed

- [x] Phase 1 — Project Setup
- [x] Phase 2 — UI Development（深色主题、统计卡片、Canvas、控制按钮、响应式）
- [x] Phase 3 — Core Gameplay（移动、食物、碰撞、增长、结束逻辑）
- [x] Phase 4 — Game Management（开始、暂停、重启、难度、分数、等级、最高分）
- [x] 特殊食物与 Tail Trimmer Buff
- [x] 游戏模式：Classic / Portal / Obstacle Maze
- [x] 粒子爆炸、飘字与屏幕震动
- [x] 本地 Top 5 排行榜
- [x] 多主题切换（Neon Green / Synthwave / GameBoy）

### Planned (see [PLAN.md](./PLAN.md))

- [ ] Web Audio 音效与静音开关（`M` 键）
- [ ] 新道具：Snail（慢动作）、Speed Surge（双倍分数）
- [ ] 触屏滑动控制与虚拟方向键
- [ ] 第四个主题：Amber Terminal
- [ ] 排行榜同时记录难度
- [ ] 成就系统
- [ ] 将 `main.js` 拆分为多个 ES 模块

---

## 🐞 8. Known Issues

- 游戏结束后只弹出排行榜，不显示结束 Overlay；关闭弹窗后需按 Enter 或点击 RESTART 才能重新开始。
- Tail Trimmer 的 Buff 条目前只是倒计时显示，没有实际效果。
- 特殊食物提示文字会在下一步被状态栏的 `PLAYING` 覆盖，几乎看不到。
- 暂停期间特殊食物和 Buff 的计时不会暂停。
- Obstacle 模式下障碍可能生成在蛇头正前方；游戏中途切换到该模式时，障碍可能生成在蛇身上。

---

## 🧪 9. Testing Checklist

- [ ] 游戏能够正常加载，控制台没有未处理的错误。
- [ ] 蛇能向四个方向移动，且不能直接反向移动。
- [ ] 吃到食物后蛇增长，分数和等级正确更新。
- [ ] 食物不会生成在蛇身或障碍物上。
- [ ] 撞墙、撞自己、撞障碍都会结束游戏（Portal 模式下穿墙不会结束）。
- [ ] 暂停后蛇不再移动，继续后正常运行。
- [ ] 重新开始后状态完全重置。
- [ ] 难度和模式选择确实生效。
- [ ] 特殊食物会在 6 秒后消失，三种食物效果正确。
- [ ] 最高分、排行榜和主题在刷新页面后仍然保留。
- [ ] 三个主题下 UI 和 Canvas 配色都正确。
- [ ] 不同屏幕尺寸下没有横向滚动或严重溢出。

---

## 📦 10. Running the Project

本项目使用原生 HTML、CSS 和 JavaScript，不需要安装 Node.js 或任何构建工具。

### Option 1 — Open in Browser

直接使用浏览器打开 `index.html`。

### Option 2 — VS Code Live Server

在 VS Code 中打开项目文件夹，使用 Live Server 等本地预览工具运行。

### Option 3 — WSL Ubuntu

```bash
cd ~/projects/modern-snake
code .
```

保存文件后，在浏览器中查看效果。

---

## 📝 11. Project Status

**Current Stage:** Playable — 核心玩法、模式、排行榜和主题均已完成，正在进行打磨与功能扩展。

**Next Priority:** 修复已知问题，然后实现音效与触屏控制。

---

## 📄 License

暂定为个人学习项目。若未来公开发布或接受他人贡献，可以根据实际需要选择合适的开源许可证。
