"use client";

import React, { useState, useEffect } from "react";
import { Home, LayoutGrid, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingBottomBarProps {
  activeNav: string;
  onNavClick: (navId: string) => void;
}

/**
 * Floating Bottom Bar Navigation dengan desain mengambang (floating dock/pill),
 * hanya menampilkan menu-menu utama (Beranda, Aplikasi, Panduan) dan otomatis muncul
 * saat halaman di-scroll melewati header.
 */
export function FloatingBottomBar({
  activeNav,
  onNavClick,
}: FloatingBottomBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Muncul setelah scroll melewati header awal (> 90px)
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 90);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navItems = [
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "aplikasi", label: "Aplikasi", icon: LayoutGrid },
    { id: "panduan", label: "Panduan", icon: BookOpen },
  ];

  return (
    <aside
      aria-label="Navigasi Menu Cepat Mengambang"
      className={cn(
        "fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out select-none",
        isVisible
          ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
          : "translate-y-12 opacity-0 scale-90 pointer-events-none"
      )}
    >
      <nav className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/80 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.18),0_0_0_1px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavClick(item.id)}
              aria-label={item.label}
              className={cn(
                "flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all duration-200 select-none",
                isActive
                  ? "bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(37,99,235,0.3)] scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 active:scale-95"
              )}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
