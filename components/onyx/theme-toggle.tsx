"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

const STORAGE_KEY = "onyx-theme";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  // Initialise from the actual DOM so SSR markup matches the inline-script
  // boot. Avoids a flash-of-wrong-icon on first paint.
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore — preference just won't persist
    }
  }

  // Render a stable shell on first paint to avoid hydration mismatches; once
  // mounted, swap the real icon in.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className={[
        "relative h-8 w-8 inline-flex items-center justify-center",
        "border border-onyx-line text-onyx-mute hover:text-onyx-amber hover:border-onyx-amber",
        "transition-[color,border-color,transform] duration-200 ease-onyx-out",
        "active:scale-90 rounded-full",
      ].join(" ")}
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun size={14} strokeWidth={1.6} className="onyx-enter" />
        ) : (
          <Moon size={14} strokeWidth={1.6} className="onyx-enter" />
        )
      ) : (
        <span className="block h-3.5 w-3.5" />
      )}
    </button>
  );
}
