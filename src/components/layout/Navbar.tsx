"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Layers, Download, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  activeNav?: string;
  onNavClick?: (nav: string) => void;
}

export function Navbar({
  searchQuery = "",
  onSearchChange,
  activeNav = "aplikasi",
  onNavClick,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "beranda", label: "Beranda", href: "#beranda" },
    { id: "aplikasi", label: "Aplikasi", href: "#katalog" },
    { id: "panduan", label: "Panduan", href: "#panduan-apk" },
  ];

  const handleItemClick = (id: string) => {
    if (onNavClick) onNavClick(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div
          onClick={() => handleItemClick("beranda")}
          className="flex items-center gap-0 cursor-pointer select-none group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.png"
            alt="AppHub Logo"
            className="h-11 w-11 sm:h-12 sm:w-12 object-contain drop-shadow-sm transition-transform group-hover:scale-105 -mr-1"
          />
          <span className="text-xl sm:text-2xl font-black tracking-tight font-display select-none py-0.5">
            <span className="inline-block text-3d-bubble-main">App</span>
            <span className="inline-block text-3d-bubble-blue">Hub</span>
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
                    ? "bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] scale-105"
                    : "text-slate-600 hover:text-foreground dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Search Bar & Theme Toggle on Navbar (Right) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {onSearchChange && (
            <div className="relative hidden sm:block w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari aplikasi..."
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-foreground dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          )}

          {/* Theme Toggle (Right of Search Input) */}
          <ThemeToggle />

          {/* Mobile Menu Toggle */}
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
          {onSearchChange && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari aplikasi..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-foreground placeholder:text-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-foreground"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          )}

          <nav className="flex flex-col gap-1.5 pt-2">
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
        </div>
      )}
    </header>
  );
}

