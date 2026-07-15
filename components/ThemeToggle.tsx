"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      className={className ?? "p-2 rounded-lg transition-colors text-white/40 hover:text-white hover:bg-white/10"}
    >
      {isDark
        ? <Sun  className="w-4 h-4" aria-hidden="true" />
        : <Moon className="w-4 h-4" aria-hidden="true" />}
    </button>
  );
}
