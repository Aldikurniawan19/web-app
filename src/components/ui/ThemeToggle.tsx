"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, isMounted } = useTheme();

  if (!isMounted) {
    return (
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800",
          className
        )}
      >
        <span className="h-4 w-4" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "group relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_0_#cbd5e1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_0_#0f172a] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2.5px_0_#cbd5e1] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#cbd5e1] transition-all duration-200 select-none",
        className
      )}
      title={theme === "light" ? "Beralih ke Mode Gelap" : "Beralih ke Mode Terang"}
      aria-label={theme === "light" ? "Beralih ke Mode Gelap" : "Beralih ke Mode Terang"}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
      ) : (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
      )}
    </button>
  );
}
