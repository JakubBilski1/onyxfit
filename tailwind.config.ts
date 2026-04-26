import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        onyx: {
          bg: "#0a0a0a",
          surface: "#121212",
          card: "#171717",
          line: "rgba(255,255,255,0.08)",
          line2: "rgba(255,255,255,0.14)",
          bone: "#e8e6df",
          mute: "#8a8780",
          dim: "#5a5853",
          amber: "#f5b13a",
          amberDim: "#b78320",
          red: "#d24c4c",
          green: "#6fa872",
          ink: "#0a0a0a",
        },
      },
      letterSpacing: {
        ultra: "0.32em",
      },
      animation: {
        ping: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "fade-up": "fade-up 600ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
