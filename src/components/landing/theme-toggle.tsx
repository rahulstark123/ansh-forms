"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "ansh-landing-theme";

/**
 * Toggles a `dark` class on the nearest `.landing-page` wrapper only, so the
 * dark theme stays scoped to the landing page and never leaks into the rest of
 * the app. Defaults to light; the wrapper's inline boot script applies the
 * saved preference before paint to avoid a flash.
 */
export function LandingThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.querySelector<HTMLElement>(".landing-page");
    if (!root) return;
    // Fallback for client-side navigation (the boot script only runs on full
    // page loads): restore the saved preference if it isn't applied yet.
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore storage errors (private mode, etc.) */
    }
    if (saved === "dark") root.classList.add("dark");
    else if (saved === "light") root.classList.remove("dark");
    setIsDark(root.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const root = document.querySelector<HTMLElement>(".landing-page");
    if (!root) return;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* ignore storage errors (private mode, etc.) */
    }
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
    >
      {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
