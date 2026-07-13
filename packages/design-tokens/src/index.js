export const THEME_MODES = {
  LIGHT: "Light",
  DARK: "Dark",
};

export const FONT_STACKS = {
  body:
    "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif",
  display:
    "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", sans-serif",
  mono:
    "\"SF Mono\", \"Cascadia Code\", \"Roboto Mono\", Consolas, \"Liberation Mono\", Menlo, monospace",
};

const sharedScale = {
  "--font-body": FONT_STACKS.body,
  "--font-display": FONT_STACKS.display,
  "--font-mono": FONT_STACKS.mono,
  "--large-font-weight": "900",
  "--secondary-font-weight": "400",
  "--medium-font-weight": "500",
  "--small-font-weight": "300",
  "--x-large-font-size": "5rem",
  "--large-font-size": "4rem",
  "--medium-font-size": "3rem",
  "--small-font-size": "2.5rem",
  "--x-small-font-size": "2rem",
  "--xx-small-font-size": "1.5rem",
  "--normal-font-size": "1rem",
  "--content-max-width": "1248px",
  "--content-wide-width": "1400px",
  "--page-gutter": "clamp(1.6rem, 4vw, 5.6rem)",
  "--nav-shell-width": "min(104rem, calc(100vw - 2.4rem))",
  "--radius-control": "8px",
  "--radius-card": "8px",
  "--radius-panel": "10px",
  "--radius-capsule": "999px",
  "--surface-blur": "22px",
  "--motion-fast": "180ms ease",
  "--motion-base": "240ms ease",
  "--z-sticky": "30",
};

export const LIGHT_THEME_VARS = {
  ...sharedScale,
  "--main-text-color": "#17201d",
  "--secondary-text-color": "#65706a",
  "--main-background-color": "#ebece5",
  "--main-car-color": "#f6f7f1",
  "--secondary-car-color": "#dfe4da",
  "--success-color": "#1d4d40",
  "--info-color": "#5b796a",
  "--warn-color": "#f59e0b",
  "--error-color": "#ef4444",
  "--color-text-primary": "#17201d",
  "--color-text-secondary": "#65706a",
  "--color-text-inverse": "#f6f7f1",
  "--color-bg-page": "#ebece5",
  "--color-bg-surface": "#f6f7f1",
  "--color-bg-muted": "#dfe4da",
  "--color-bg-elevated": "#fbfcf7",
  "--color-border-soft": "rgba(255, 255, 255, 0.74)",
  "--color-border-strong": "#ccd3c8",
  "--color-accent-primary": "#1d4d40",
  "--color-accent-secondary": "#5b796a",
  "--color-accent-muted": "rgba(29, 77, 64, 0.12)",
  "--color-warning": "#f59e0b",
  "--color-error": "#ef4444",
  "--surface-glass": "rgba(246, 247, 241, 0.72)",
  "--surface-glass-strong": "rgba(246, 247, 241, 0.9)",
  "--surface-control": "rgba(255, 255, 255, 0.62)",
  "--surface-hover": "rgba(255, 255, 255, 0.82)",
  "--surface-border": "rgba(255, 255, 255, 0.74)",
  "--surface-inner-highlight": "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  "--surface-shadow": "0 24px 80px rgba(23, 32, 29, 0.1)",
  "--surface-shadow-soft": "0 14px 42px rgba(23, 32, 29, 0.1)",
  "--focus-ring": "0 0 0 3px rgba(29, 77, 64, 0.28)",
  "--page-gradient":
    "linear-gradient(180deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0) 18rem), radial-gradient(circle at 12% 8%, rgba(112, 137, 112, 0.18), transparent 28rem), radial-gradient(circle at 90% 12%, rgba(93, 121, 106, 0.14), transparent 26rem), #ebece5",
  "--admin-sidebar-bg": "#f6f7f1",
  "--admin-sidebar-fg": "#17201d",
  "--admin-sidebar-muted": "#65706a",
  "--admin-sidebar-accent": "#dfe4da",
  "--admin-sidebar-accent-fg": "#1d4d40",
  "--admin-sidebar-border": "#ccd3c8",
  "--admin-sidebar-primary": "#1d4d40",
};

export const DARK_THEME_VARS = {
  ...sharedScale,
  "--main-text-color": "#edf1e9",
  "--secondary-text-color": "#abb6af",
  "--main-background-color": "#101b18",
  "--main-car-color": "#172721",
  "--secondary-car-color": "#20342c",
  "--success-color": "#9ac2ad",
  "--info-color": "#c3d8c9",
  "--warn-color": "#f59e0b",
  "--error-color": "#f87171",
  "--color-text-primary": "#edf1e9",
  "--color-text-secondary": "#abb6af",
  "--color-text-inverse": "#101b18",
  "--color-bg-page": "#101b18",
  "--color-bg-surface": "#172721",
  "--color-bg-muted": "#20342c",
  "--color-bg-elevated": "#1c3029",
  "--color-border-soft": "rgba(205, 226, 211, 0.16)",
  "--color-border-strong": "#2c473c",
  "--color-accent-primary": "#9ac2ad",
  "--color-accent-secondary": "#c3d8c9",
  "--color-accent-muted": "rgba(154, 194, 173, 0.14)",
  "--color-warning": "#f59e0b",
  "--color-error": "#f87171",
  "--surface-glass": "rgba(23, 39, 33, 0.76)",
  "--surface-glass-strong": "rgba(23, 39, 33, 0.92)",
  "--surface-control": "rgba(237, 241, 233, 0.08)",
  "--surface-hover": "rgba(237, 241, 233, 0.13)",
  "--surface-border": "rgba(205, 226, 211, 0.16)",
  "--surface-inner-highlight": "inset 0 1px 0 rgba(237, 241, 233, 0.12)",
  "--surface-shadow": "0 24px 80px rgba(0, 0, 0, 0.32)",
  "--surface-shadow-soft": "0 14px 42px rgba(0, 0, 0, 0.24)",
  "--focus-ring": "0 0 0 3px rgba(154, 194, 173, 0.28)",
  "--page-gradient":
    "linear-gradient(180deg, rgba(237, 241, 233, 0.06), rgba(237, 241, 233, 0) 18rem), radial-gradient(circle at 12% 8%, rgba(154, 194, 173, 0.12), transparent 28rem), radial-gradient(circle at 90% 12%, rgba(195, 216, 201, 0.1), transparent 26rem), #101b18",
  "--admin-sidebar-bg": "#172721",
  "--admin-sidebar-fg": "#edf1e9",
  "--admin-sidebar-muted": "#abb6af",
  "--admin-sidebar-accent": "#203f34",
  "--admin-sidebar-accent-fg": "#cde2d3",
  "--admin-sidebar-border": "#2c473c",
  "--admin-sidebar-primary": "#9ac2ad",
};

export const THEME_VARS = {
  [THEME_MODES.LIGHT]: LIGHT_THEME_VARS,
  [THEME_MODES.DARK]: DARK_THEME_VARS,
};

export function normalizeThemeMode(mode) {
  return String(mode).toLowerCase() === "dark" ? THEME_MODES.DARK : THEME_MODES.LIGHT;
}

export function getThemeVars(mode = THEME_MODES.LIGHT) {
  return THEME_VARS[normalizeThemeMode(mode)];
}

export function applyThemeVars(mode = THEME_MODES.LIGHT, target) {
  const root =
    target || (typeof document !== "undefined" ? document.documentElement : undefined);
  const vars = getThemeVars(mode);

  if (root?.style) {
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
  }

  return vars;
}

export function getStoredTheme(fallback = THEME_MODES.LIGHT) {
  if (typeof localStorage === "undefined") return normalizeThemeMode(fallback);
  return normalizeThemeMode(localStorage.getItem("theme") || fallback);
}

export function persistTheme(mode) {
  const normalized = normalizeThemeMode(mode);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("theme", normalized);
  }
  return normalized;
}

export function getAntDesignTokens(mode = THEME_MODES.LIGHT) {
  const vars = getThemeVars(mode);

  return {
    colorPrimary: vars["--color-accent-primary"],
    colorInfo: vars["--color-accent-secondary"],
    colorSuccess: vars["--color-accent-primary"],
    colorWarning: vars["--color-warning"],
    colorError: vars["--color-error"],
    colorText: vars["--color-text-primary"],
    colorTextSecondary: vars["--color-text-secondary"],
    colorBgLayout: vars["--color-bg-page"],
    colorBgContainer: vars["--color-bg-surface"],
    colorBgElevated: vars["--color-bg-elevated"],
    colorBorder: vars["--color-border-strong"],
    colorBorderSecondary: vars["--color-border-soft"],
    borderRadius: 8,
    borderRadiusLG: 8,
    borderRadiusSM: 6,
    controlHeight: 36,
    fontFamily: FONT_STACKS.body,
    fontSize: 14,
  };
}
