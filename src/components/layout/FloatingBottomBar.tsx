"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutGrid, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingBottomBarProps {
  activeNav: string;
  onNavClick?: (navId: string) => void;
}

/**
 * Bottom Bar Navigation khusus tampilan mobile/tablet kecil.
 * Langsung terlihat sejak awal halaman dimuat tanpa perlu menunggu scroll,
 * dan disembunyikan pada tampilan desktop (md:hidden).
 */
export function FloatingBottomBar({
  activeNav,
  onNavClick,
}: FloatingBottomBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "aplikasi", label: "Aplikasi", icon: LayoutGrid },
    { id: "panduan", label: "Panduan", icon: BookOpen },
  ];

  const handleClick = (id: string) => {
    if (pathname !== "/") {
      if (id === "beranda") {
        router.push("/");
      } else if (id === "aplikasi") {
        router.push("/aplikasi");
      } else if (id === "panduan") {
        router.push("/#panduan-apk");
      }
      return;
    }
    if (onNavClick) onNavClick(id);
  };

  return (
    <aside
      aria-label="Navigasi Menu Mobile"
      className="md:hidden fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 select-none w-[calc(100vw-32px)] max-w-sm sm:max-w-md sm:w-auto pointer-events-auto"
    >
      <nav className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/80 shadow-[0_16px_40px_-8px_rgba(15,23,42,0.2),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)] w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.id)}
              aria-label={item.label}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 select-none",
                isActive
                  ? "bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_6px_rgba(37,99,235,0.35)] scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
              )}
            >
              <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
