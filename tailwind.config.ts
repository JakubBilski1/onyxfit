import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-instrument)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      colors: {
        // Semantic tokens — preferred for new code
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
        "card-2": "rgb(var(--c-card-2) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        "line-strong": "rgb(var(--c-line-strong) / <alpha-value>)",
        fg: "rgb(var(--c-fg) / <alpha-value>)",
        "fg-2": "rgb(var(--c-fg-2) / <alpha-value>)",
        "fg-3": "rgb(var(--c-fg-3) / <alpha-value>)",
        primary: "rgb(var(--c-primary) / <alpha-value>)",
        "primary-fg": "rgb(var(--c-primary-fg) / <alpha-value>)",
        violet: "rgb(var(--c-violet) / <alpha-value>)",
        emerald: "rgb(var(--c-emerald) / <alpha-value>)",
        rose: "rgb(var(--c-rose) / <alpha-value>)",
        sky: "rgb(var(--c-sky) / <alpha-value>)",

        // Backwards-compatible legacy onyx-* (so hundreds of existing class
        // usages continue to work and theme-switch correctly)
        onyx: {
          bg: "rgb(var(--c-bg) / <alpha-value>)",
          surface: "rgb(var(--c-surface) / <alpha-value>)",
          card: "rgb(var(--c-card) / <alpha-value>)",
          line: "rgb(var(--c-line) / <alpha-value>)",
          line2: "rgb(var(--c-line-strong) / <alpha-value>)",
          bone: "rgb(var(--c-bone) / <alpha-value>)",
          mute: "rgb(var(--c-mute) / <alpha-value>)",
          dim: "rgb(var(--c-dim) / <alpha-value>)",
          amber: "rgb(var(--c-amber) / <alpha-value>)",
          amberDim: "rgb(var(--c-amber-dim) / <alpha-value>)",
          red: "rgb(var(--c-red) / <alpha-value>)",
          green: "rgb(var(--c-green) / <alpha-value>)",
          ink: "rgb(var(--c-ink) / <alpha-value>)",
        },
      },
      borderRadius: {
        none: "0",
        xs: "4px",
        sm: "6px",
        DEFAULT: "10px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
        full: "9999px",
      },
      letterSpacing: {
        ultra: "0.32em",
      },
      boxShadow: {
        "soft": "0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.06)",
        "lift": "0 8px 32px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.06)",
        "glow-primary": "0 0 0 1px rgb(var(--c-primary) / .45), 0 8px 32px rgb(var(--c-primary) / .25)",
        "glow-violet": "0 0 0 1px rgb(var(--c-violet) / .45), 0 8px 32px rgb(var(--c-violet) / .22)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.2, 0.7, 0.2, 1)",
        "back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      animation: {
        "fade-up": "onyx-fade-up 520ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "fade-in": "fade-in 280ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "scale-in": "scale-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "slide-down": "slide-in-down 240ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "blob": "onyx-blob 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
