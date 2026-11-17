"use client";

import React from "react";
import Link from "next/link";
import {
  Menu,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export function AdminHeader({ onToggleSidebar, title = "Dashboard Administrator" }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-8 backdrop-blur-md transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka navigasi sidebar"
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-slate-900 font-display">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Security Badge & Quick Action */}
      <div className="flex items-center gap-3">
        {/* Security Indicator Badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Akses Terenkripsi & Terproteksi</span>
        </div>

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
