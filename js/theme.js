/* ============================================================
   Modern Snake — Theme Switcher
   Themes: "neon-green" | "synthwave" | "gameboy"
   Persisted to localStorage under key modern_snake_theme
============================================================ */

(function () {
  const STORAGE_KEY = "modern_snake_theme";
  const DEFAULT_THEME = "neon-green";

  const themeBtn = document.getElementById("theme-btn");
  const themeMenu = document.getElementById("theme-menu");
  const themeOptions = document.querySelectorAll(".theme-option");

  // Canvas colours per theme (used by drawBackground in main.js via CSS vars)
  // The canvas itself is drawn programmatically, so we expose the active
  // theme token as a data-attribute on <html> and read CSS variables where
  // needed, but also update the JS-driven canvas colours via a global map.
  const THEME_CANVAS = {
    "neon-green": {
      bg: "#0b1217",
      gridLine: "rgba(57, 255, 136, 0.055)",
      snake: { head: "#70ffab", body: "#39d978", shadow: "#39ff88" },
      food: "#ff5263",
    },
    synthwave: {
      bg: "#080115",
      gridLine: "rgba(255, 110, 199, 0.06)",
      snake: { head: "#ff9ef5", body: "#d94ec2", shadow: "#ff6ec7" },
      food: "#ff4f82",
    },
    gameboy: {
      bg: "#0f1106",
      gridLine: "rgba(139, 172, 15, 0.07)",
      snake: { head: "#b8c830", body: "#8bac0f", shadow: "#8bac0f" },
      food: "#c8602c",
    },
  };

  // Expose to global so main.js can read it
  window.SNAKE_THEME = THEME_CANVAS;

  function applyTheme(theme) {
    // Set data-theme on <html> — drives all CSS custom-property overrides
    document.documentElement.setAttribute(
      "data-theme",
      theme === "neon-green" ? "" : theme,
    );

    // Mark the active option button
    themeOptions.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.theme === theme);
    });

    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}

    // Tell main.js to redraw with the new palette (if the game is not running,
    // drawGame is fine; if running, the next frame will pick it up automatically)
    if (typeof drawGame === "function") {
      drawGame();
    }
  }

  function loadTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    } catch (_) {
      return DEFAULT_THEME;
    }
  }

  // Toggle dropdown open/close
  themeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    themeMenu.hidden = !themeMenu.hidden;
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    themeMenu.hidden = true;
  });

  themeMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Handle theme option selection
  themeOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTheme(btn.dataset.theme);
      themeMenu.hidden = true;
    });
  });

  // Apply saved theme on page load
  applyTheme(loadTheme());
})();
