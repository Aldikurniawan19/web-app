"use client";

import React from "react";
import Link from "next/link";
import {
  Menu,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export function AdminHeader({ onToggleSidebar, title = "Dashboard Administrator" }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 sm:px-8 backdrop-blur-md transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka navigasi sidebar"
          className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-slate-900 dark:text-white font-display">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Security Badge, Theme Toggle & Quick Action */}
      <div className="flex items-center gap-3">
        {/* Security Indicator Badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Akses Terenkripsi & Terproteksi</span>
        </div>

        {/* Unified Theme Toggle */}
        <ThemeToggle />

        {/* Quick Upload CTA */}
        <Link href="/admin/apps/new">
          <Button
            size="sm"
            variant="primary"
            className="hidden sm:flex items-center gap-2 rounded-xl text-xs font-bold shadow-sm shadow-primary/20"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Unggah APK</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
