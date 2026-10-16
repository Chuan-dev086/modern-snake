# 🐍 Modern Snake Game

一个使用原生 HTML、CSS 和 JavaScript 开发的现代化贪吃蛇游戏。项目采用深色主题与霓虹绿色视觉风格，结合 Canvas 游戏渲染、实时分数统计、难度选择和响应式布局，打造简洁、流畅且具有现代游戏 Dashboard 风格的体验。

## 📌 1. Project Overview

### Project Goals

- 学习 HTML、CSS 和 JavaScript 的实际应用。
- 理解 Canvas 绘图与游戏循环的基本原理。
- 学习键盘事件、游戏状态管理和碰撞检测。
- 实现分数、等级、难度与最高分系统。
- 练习使用 Git、GitHub 和 WSL 管理项目。
- 为未来增加更多游戏机制和功能打下基础。

### Technology Stack

| Technology              | Purpose                              |
| ----------------------- | ------------------------------------ |
| HTML5                   | 构建游戏页面与 UI 结构               |
| CSS3                    | 负责视觉设计、布局、动画和响应式样式 |
| JavaScript (Vanilla JS) | 实现游戏逻辑与交互                   |
| HTML Canvas             | 绘制蛇、食物和游戏区域               |
| LocalStorage            | 保存最高分与玩家设置                 |
| Git & GitHub            | 版本控制与项目管理                   |
| WSL + Ubuntu            | Linux 开发环境                       |
| VS Code                 | 编写和管理项目代码                   |

**Development Principles**

- 不使用 React、Vue 等前端框架。
- 不需要 Vite、Node.js 或后端服务器。
- 优先使用原生 JavaScript 理解底层逻辑。
- 采用模块化的文件组织方式，避免把所有代码写在一个文件中。
- 先完成核心游戏，再逐步增加高级功能。

---

## 📁 2. Project File Structure

```text
modern-snake/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/
    ├── images/
    └── icons/
```

### File Responsibilities

#### `index.html`

负责游戏页面的 HTML 结构。

主要内容：

- 游戏标题和品牌区域。
- 分数、最高分和等级显示。
- Canvas 游戏画布。
- 开始、暂停和重新开始按钮。
- 难度选择器。
- 游戏开始提示和结束弹窗。
- 操作说明与页脚。
- 引入 CSS 和 JavaScript 文件。

#### `css/style.css`

负责整个游戏的外观和布局。

主要内容：

- 深色游戏主题。
- 霓虹绿色强调色。
- 游戏信息卡片与按钮样式。
- Canvas 游戏区域样式。
- 游戏结束 Overlay。
- 按钮 Hover、Focus 和点击效果。
- 响应式布局与手机屏幕适配。
- 必要的过渡动画。

#### `js/main.js`

负责核心游戏逻辑。

主要内容：

- 获取 HTML 元素与 Canvas 绘图环境。
- 初始化游戏状态。
- 绘制蛇、食物和游戏背景。
- 处理键盘与按钮事件。
- 控制蛇的移动。
- 检测食物碰撞和自身碰撞。
- 更新分数与等级。
- 控制开始、暂停、结束和重新开始。
- 保存与读取最高分。

#### `assets/`

存放可选的图片、图标和其他静态资源。初期可以保持为空，不需要为了项目启动而添加额外资源。

---

## 🎮 3. Core Game Features

### 3.1 Snake Movement

- 使用 Canvas 绘制蛇。
- 使用网格系统控制蛇的移动。
- 支持键盘方向控制。
- 蛇吃到食物后增长。
- 蛇不能直接反向移动。
- 蛇的移动必须保持连续、可预测。

### 3.2 Food System

- 食物随机生成在有效网格位置。
- 食物不能生成在蛇的身体上。
- 蛇吃到食物后增加分数。
- 吃到食物后立即生成新的食物。
- 可选：未来加入特殊食物与奖励效果。

### 3.3 Collision Detection

游戏需要检测以下碰撞：

- **Wall Collision：** 蛇撞到游戏区域边界。
- **Self Collision：** 蛇撞到自己的身体。
- **Food Collision：** 蛇头碰到食物。

撞墙或撞到自己时，游戏结束；吃到食物时，更新分数并增长蛇的身体。

### 3.4 Score System

游戏顶部显示实时统计数据：

| Statistic  | Description  |
| ---------- | ------------ |
| Score      | 当前游戏分数 |
| Best Score | 历史最高分   |
| Level      | 当前游戏等级 |

建议每吃到一个普通食物获得 10 分。等级可以根据分数逐步提升，并影响蛇的移动速度。

### 3.5 Difficulty Levels

提供三种难度供玩家选择：

| Difficulty | Description                      |
| ---------- | -------------------------------- |
| Easy       | 较慢的移动速度，适合初学者       |
| Normal     | 平衡的游戏速度                   |
| Hard       | 较快的移动速度，适合有经验的玩家 |

实际速度可以在开发和测试时调整。

### 3.6 Game States

游戏需要具有清晰的状态管理：

- **Ready：** 游戏尚未开始。
- **Playing：** 游戏正在运行。
- **Paused：** 游戏已暂停。
- **Game Over：** 玩家已失败。
- **Restart：** 重置游戏并重新开始。

避免在暂停或游戏结束后继续执行蛇的移动逻辑。

---

## 🎨 4. UI / UX Design

### Visual Style

采用现代化 Arcade Game Dashboard 风格。

- 深色背景。
- 霓虹绿色作为主要强调色。
- 卡片式统计信息布局。
- 简洁的游戏区域。
- 圆角按钮与适度的发光效果。
- 清晰的字体、间距和视觉层次。
- 轻量动画，避免过度装饰。

### Main Interface Layout

```text
┌─────────────────────────────────────┐
│           MODERN SNAKE               │
│        Ready to challenge?           │
├─────────────────────────────────────┤
│   SCORE      BEST SCORE      LEVEL  │
│     0             0             1   │
├─────────────────────────────────────┤
│                                     │
│                                     │
│            GAME CANVAS              │
│                                     │
│                                     │
├─────────────────────────────────────┤
│    [ START ]     [ RESTART ]        │
│                                     │
│   Difficulty: [ Normal        ▼ ]   │
├─────────────────────────────────────┤
│   Arrow Keys / WASD to Move         │
│   Space to Pause                    │
└─────────────────────────────────────┘
```

### UI Requirements

- 游戏信息应清晰可读。
- 开始游戏前显示操作提示。
- 暂停时显示暂停状态。
- 游戏结束时显示最终分数。
- 最高分更新时应及时刷新界面。
- 按钮必须具有明确的交互反馈。
- 手机和小屏幕上不能出现严重溢出或横向滚动。

---

## ⌨️ 5. Controls

### Keyboard Controls

| Key           | Action                     |
| ------------- | -------------------------- |
| Arrow Up      | 向上移动                   |
| Arrow Down    | 向下移动                   |
| Arrow Left    | 向左移动                   |
| Arrow Right   | 向右移动                   |
| W / A / S / D | 替代方向控制               |
| Space         | 暂停或继续                 |
| Enter         | 开始游戏或在结束后重新开始 |

控制要求：

- 蛇不能直接向相反方向移动。
- 游戏运行时，方向输入应及时响应。
- 暂停时停止游戏逻辑。
- 避免按键输入导致浏览器页面意外滚动。
- 游戏未开始或已结束时，应正确处理方向输入。

---

## 💾 6. Data Persistence

使用浏览器的 `localStorage` 保存简单的本地数据。

### Best Score

建议存储键：

```text
modern_snake_best_score
```

功能要求：

- 页面加载时读取最高分。
- 游戏结束或分数更新时判断是否打破纪录。
- 只有达到更高分数时才更新最高分。
- 页面刷新后仍保留最高分。

### Future Settings

未来可以保存：

- 玩家偏好的难度。
- 音效开关。
- 是否启用辅助功能。
- 其他游戏设置。

注意：`localStorage` 保存的是当前浏览器本地数据，不会自动同步到其他设备。

---

## 🧩 7. Game Logic Architecture

建议按照以下顺序理解和实现游戏逻辑：

```text
Initialize Game
       ↓
Set Initial State
       ↓
Draw Game Board
       ↓
Wait for Player Input
       ↓
Update Snake Position
       ↓
Check Collisions
       ↓
Did Snake Eat Food?
       ↓
Update Score & Food
       ↓
Draw Updated Frame
       ↓
Continue Game Loop
```

如果发生撞墙或自身碰撞，则停止游戏循环，并显示 Game Over 界面。

### Important Concepts to Learn

- DOM Selection
- Event Listeners
- Canvas Rendering
- JavaScript Arrays and Objects
- Game State Management
- Keyboard Input Handling
- Collision Detection
- Random Number Generation
- `requestAnimationFrame()` 或定时器驱动的游戏循环
- `localStorage`
- Responsive CSS

---

## 🛠️ 8. Development Roadmap

### Phase 1 — Project Setup

- [ ] 创建项目文件夹。
- [ ] 创建 HTML、CSS 和 JavaScript 文件。
- [ ] 在 VS Code 中打开项目。
- [ ] 完成基本 HTML 页面结构。
- [ ] 确认 CSS 和 JavaScript 成功加载。

### Phase 2 — UI Development

- [ ] 完成深色主题布局。
- [ ] 创建游戏统计卡片。
- [ ] 添加 Canvas。
- [ ] 添加开始与重新开始按钮。
- [ ] 添加难度选择器。
- [ ] 完成基本响应式样式。

### Phase 3 — Core Gameplay

- [ ] 初始化蛇的位置和长度。
- [ ] 绘制蛇与游戏网格。
- [ ] 实现蛇的移动。
- [ ] 实现方向键和 WASD 控制。
- [ ] 实现食物随机生成。
- [ ] 实现吃食物与身体增长。
- [ ] 实现撞墙检测。
- [ ] 实现自身碰撞检测。
- [ ] 实现游戏结束逻辑。

### Phase 4 — Game Management

- [ ] 实现开始游戏。
- [ ] 实现暂停和继续。
- [ ] 实现重新开始。
- [ ] 实现难度选择。
- [ ] 实现实时分数更新。
- [ ] 实现等级系统。
- [ ] 实现最高分保存。
- [ ] 完成 Game Over Overlay。

### Phase 5 — Polish and Testing

- [ ] 优化 Canvas 绘制效果。
- [ ] 添加按钮交互反馈。
- [ ] 调整游戏速度与难度平衡。
- [ ] 测试快速连续按键。
- [ ] 测试暂停与重新开始。
- [ ] 测试最高分保存。
- [ ] 测试不同屏幕尺寸。
- [ ] 修复控制台错误。

### Phase 6 — Optional Advanced Features

- [ ] 音效开关。
- [ ] 背景音乐。
- [ ] 手机触控方向控制。
- [ ] 最高分排行榜。
- [ ] 多种食物与奖励机制。
- [ ] 游戏主题切换。
- [ ] 更丰富的游戏动画。
- [ ] 成就系统。

---

## 🧪 9. Testing Checklist

在发布前，确认以下行为正确：

- [ ] 游戏能够正常加载。
- [ ] 蛇能向四个方向移动。
- [ ] 蛇不能直接反向移动。
- [ ] 吃到食物后蛇会增长。
- [ ] 食物不会生成在蛇身上。
- [ ] 吃到食物后分数正确增加。
- [ ] 撞墙会结束游戏。
- [ ] 撞到自己会结束游戏。
- [ ] 暂停后蛇不再移动。
- [ ] 继续游戏后能正常运行。
- [ ] 重新开始后状态正确重置。
- [ ] 难度选择确实会影响速度。
- [ ] 最高分在刷新页面后仍然保留。
- [ ] 游戏界面在不同尺寸下正常显示。
- [ ] 浏览器控制台没有未处理的错误。

---

## 🚀 10. Future Improvements

核心游戏完成后，可以逐步考虑以下方向：

**Gameplay**

- 新增障碍物与特殊关卡。
- 添加限时挑战模式。
- 添加不同类型的食物。
- 增加连续吃食物的奖励机制。

**User Experience**

- 添加音效设置。
- 增加开始倒计时。
- 添加更细致的暂停动画。
- 支持手机触控。

**Technical Improvements**

- 将游戏逻辑与 UI 更新分离。
- 减少不必要的 DOM 操作。
- 优化游戏循环和 Canvas 绘制。
- 逐步将代码拆分为多个 JavaScript 模块。

---

## 📦 11. Running the Project

本项目使用原生 HTML、CSS 和 JavaScript，不需要安装 Node.js 或配置构建工具。

### Option 1 — Open in Browser

直接使用浏览器打开 `index.html`。

### Option 2 — VS Code

在 VS Code 中打开项目文件夹，并使用 Live Server 等本地预览工具运行。

### Option 3 — WSL Ubuntu

在 WSL 中进入项目目录，使用 VS Code 打开：

```bash
cd ~/projects/modern-snake
code .
```

保存文件后，在浏览器中查看效果。

---

## 📝 12. Project Status

**Current Stage:** Planning / Initial Development

**Priority:** Build a playable snake game first, then improve its appearance and add advanced features.

**Main Goal:** Learn the fundamentals of web development by building a complete, playable game from scratch.

---

## 📄 License

暂定为个人学习项目。若未来公开发布或接受他人贡献，可以根据实际需要选择合适的开源许可证。
