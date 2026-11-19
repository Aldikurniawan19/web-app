"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  UploadCloud,
  ShieldCheck,
  ExternalLink,
  LogOut,
  Sparkles,
  Smartphone,
  Globe,
  PlusCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };

  const appNavItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Kelola Aplikasi",
      href: "/admin/apps",
      icon: Layers,
      exact: false,
    },
    {
      label: "Unggah APK Baru",
      href: "/admin/apps/new",
      icon: UploadCloud,
      exact: true,
    },
  ];

  const webNavItems = [
    {
      label: "Kelola Projek Web",
      href: "/admin/web-projects",
      icon: Globe,
      exact: false,
    },
    {
      label: "Tambah Projek Web",
      href: "/admin/web-projects/new",
      icon: PlusCircle,
      exact: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
            <Link
              href="/admin"
              className="flex items-center gap-3 font-display text-lg font-black tracking-tight text-slate-900"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight font-extrabold text-foreground">alllprojects</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                  Admin Portal
                </span>
              </div>
            </Link>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup menu navigasi"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {/* Group 1: Aplikasi APK */}
            <div>
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Manajemen APK
              </div>
              <nav className="space-y-1">
                {appNavItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all select-none",
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/25"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Group 2: Projek Web */}
            <div>
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Manajemen Projek Web
              </div>
              <nav className="space-y-1">
                {webNavItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all select-none",
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/25"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Link to Public Store */}
            <div>
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Akses Eksternal
              </div>
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                  <span>Landing Page Publik</span>
                </div>
              </Link>
            </div>
          </div>

          {/* User Profile & Logout Bottom Bar */}
          <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300">
                AD
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  Administrator
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Sesi Aktif</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all select-none"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
