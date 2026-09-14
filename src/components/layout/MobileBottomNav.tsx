"use client";

import React from "react";
import { Home, BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";

function AndroidIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h4v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.72 2.24 12.88 2 12 2c-.88 0-1.72.24-2.64.63L7.88 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.75 4.3 5.53 6 5.14 8h13.72c-.39-2-1.61-3.7-3.33-4.84zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
    </svg>
  );
}

interface MobileBottomNavProps {
  activeNav: string;
  onNavClick: (nav: string) => void;
}

export function MobileBottomNav({
  activeNav,
  onNavClick,
}: MobileBottomNavProps) {
  const navItems = [
    { id: "beranda", label: "Beranda", icon: Home, filled: false },
    { id: "aplikasi", label: "Aplikasi", icon: AndroidIcon, filled: true },
    { id: "panduan", label: "Panduan", icon: BookOpenText, filled: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-40 flex sm:hidden h-16 w-full items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 shadow-lg transition-colors duration-200">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeNav === item.id;

        const iconSize = item.filled
          ? isActive ? "h-[17px] w-[17px]" : "h-[17px] w-[17px]"
          : isActive ? "h-4.5 w-4.5" : "h-5 w-5";

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavClick(item.id)}
            aria-label={item.label}
            className={cn(
              "flex items-center justify-center transition-all duration-300 select-none",
              isActive
                ? "gap-2 h-10 px-4 rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] -translate-y-0.5 scale-105"
                : "h-10 w-11 rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
            )}
          >
            <Icon
              className={cn("shrink-0", iconSize)}
              strokeWidth={isActive ? 2.5 : 2}
            />
            {isActive && (
              <span className="text-xs font-bold whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

