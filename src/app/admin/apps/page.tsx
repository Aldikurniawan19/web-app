"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  HardDrive,
  Calendar,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { AppCategory, AppItem } from "@/types/store";
import { CATEGORIES } from "@/constants/app-store-data";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";

export default function AdminAppsListPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>("Semua");
  const [deleteTargetApp, setDeleteTargetApp] = useState<AppItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/apps");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setApps(json.data || []);
        }
      }
    } catch (err) {
      console.error("Gagal memuat aplikasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetApp) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/apps?id=${deleteTargetApp.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTargetApp(null);
        fetchApps();
      }
    } catch (err) {
      console.error("Gagal menghapus:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.developer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua" || app.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Kelola Seluruh Aplikasi APK
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Publikasikan, edit metadata deskripsi, atau hapus aplikasi dari ekosistem AppHub.
          </p>
        </div>

        <Link href="/admin/apps/new">
          <Button variant="primary" size="sm" className="shadow-sm shadow-primary/20">
            <Plus className="h-4 w-4" />
            <span>Unggah APK Baru</span>
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, developer, atau deskripsi..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all select-none ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-sm"
                  : "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Apps Cards (responsive cards view for rich details) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            Memuat daftar aplikasi...
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            Tidak ada aplikasi ditemukan untuk filter ini.
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all space-y-4"
            >
              {/* Top: Icon & Basic Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <AppIcon
                    type={app.iconType}
                    iconUrl={app.iconUrl}
                    colorClass={app.iconColor}
                    size="md"
                    className="h-12 w-12 rounded-2xl shrink-0"
                  />
                  <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                    {app.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display truncate">
                    {app.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {app.developer}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>
                </div>
              </div>

              {/* Meta stats */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{app.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <HardDrive className="h-3 w-3" />
                  <span>{app.fileSize}</span>
                </div>
                <span className="font-mono">v{app.version}</span>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {app.lastUpdated}
                </span>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/apps/${app.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeleteTargetApp(app)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors"
                    title="Hapus aplikasi"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Modal */}
      {deleteTargetApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Konfirmasi Hapus Aplikasi
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong>{deleteTargetApp.name}</strong>? Data aplikasi dan paket APK akan dihapus dari katalog publik.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeleteTargetApp(null)}
              >
                Batal
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
