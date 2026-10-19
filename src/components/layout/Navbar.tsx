"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Official GitHub Mark (Octocat) SVG Silhouette
 */
function GithubBrandIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
      />
    </svg>
  );
}

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  activeNav?: string;
  onNavClick?: (nav: string) => void;
}

export function Navbar({
  activeNav = "aplikasi",
  onNavClick,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const navItems = [
    { id: "beranda", label: "Beranda", href: "#beranda" },
    { id: "aplikasi", label: "Aplikasi", href: "#katalog" },
    { id: "panduan", label: "Panduan", href: "#panduan-apk" },
  ];

  // Tutup menu otomatis ketika pengguna mengklik area luar menu
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const handleItemClick = (id: string) => {
    if (onNavClick) onNavClick(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors duration-200"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo / Brand Name */}
          <div
            onClick={() => handleItemClick("beranda")}
            className="flex items-center cursor-pointer select-none group"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight font-display select-none py-0.5 transition-transform group-hover:scale-105">
              <span className="inline-block text-3d-bubble-main">All</span>
              <span className="inline-block text-3d-bubble-blue">Project</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "relative px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 select-none",
                    isActive
                      ? "bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a]"
                      : "text-slate-600 hover:text-foreground dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: GitHub Link & Theme Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* GitHub Profile Link (Fully Matches ThemeToggle Component) */}
            <a
              href="https://github.com/Aldikurniawan19"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile Aldikurniawan19"
              title="Kunjungi GitHub Aldikurniawan19"
              className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_0_#cbd5e1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_0_#0f172a] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2.5px_0_#cbd5e1] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#cbd5e1] transition-all duration-200 select-none"
            >
              <GithubBrandIcon className="h-4.5 w-4.5 text-slate-800 dark:text-white transition-transform duration-300 group-hover:scale-110" />
            </a>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-4 space-y-3 shadow-lg">
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold text-left transition-all select-none",
                      isActive
                        ? "bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a]"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    )}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile GitHub Direct Link */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">GitHub Repository</span>
              <a
                href="https://github.com/Aldikurniawan19"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_0_#cbd5e1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_0_#0f172a] hover:-translate-y-0.5 transition-all select-none"
              >
                <GithubBrandIcon className="h-4 w-4 text-slate-800 dark:text-white" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">@Aldikurniawan19</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Click-Outside Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/40 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
