import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        body: ["var(--font-plex)", "var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-instrument)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      colors: {
        // All onyx colors are CSS-variable backed so the entire palette flips
        // when [data-theme] swaps on <html>. Opacity modifiers (e.g. /10) keep
        // working because each color is exposed as `rgb(<r> <g> <b> / <a>)`.
        onyx: {
          bg: "rgb(var(--c-bg) / <alpha-value>)",
          surface: "rgb(var(--c-surface) / <alpha-value>)",
          card: "rgb(var(--c-card) / <alpha-value>)",
          line: "rgb(var(--c-line) / <alpha-value>)",
          line2: "rgb(var(--c-line2) / <alpha-value>)",
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
      letterSpacing: {
        ultra: "0.32em",
      },
      boxShadow: {
        "onyx-soft": "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        "onyx-lift": "0 6px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
        "onyx-glow": "0 0 0 1px rgb(var(--c-amber) / 0.4), 0 8px 32px rgb(var(--c-amber) / 0.18)",
      },
      transitionTimingFunction: {
        "onyx-out": "cubic-bezier(0.2, 0.7, 0.2, 1)",
      },
      animation: {
        "fade-up": "fade-up 600ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "fade-in": "fade-in 280ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "scale-in": "scale-in 200ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        shimmer: "shimmer 2.4s linear infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
