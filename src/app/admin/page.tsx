"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Download,
  HardDrive,
  ShieldCheck,
  Plus,
  UploadCloud,
  ArrowRight,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Star,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AppItem } from "@/types/store";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AdminDashboardPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [stats, setStats] = useState({
    totalApps: 0,
    totalStorageFormatted: "0 MB",
    totalDownloadsEst: "0+",
    latestUpdated: "-",
    categoriesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
          if (json.stats) setStats(json.stats);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data aplikasi:", err);
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
    const q = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q) ||
      app.developer.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-600/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Pusat Manajemen Berkas & Katalog APK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
              Selamat Datang di Portal Admin
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Kelola seluruh paket instalasi aplikasi Android, sesuaikan deskripsi, perbarui rilis versi, dan pantau metrik katalog secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/admin/apps/new">
              <Button
                variant="secondary"
                size="md"
                className="bg-white hover:bg-slate-100 text-blue-700 font-bold text-xs shadow-md border-0"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Unggah APK Baru</span>
              </Button>
            </Link>

            <Link href="/" target="_blank">
              <Button
                variant="outline"
                size="md"
                className="border-white/30 text-white hover:bg-white/10 text-xs"
              >
                <span>Lihat Web Publik</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Apps */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Total Aplikasi APK
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-primary">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-display">
              {stats.totalApps} Aplikasi
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Dalam {stats.categoriesCount} kategori aktif
            </p>
          </div>
        </div>

        {/* Metric 2: Total Storage */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Penyimpanan APK
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-display">
              {stats.totalStorageFormatted}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Akumulasi ukuran berkas paket
            </p>
          </div>
        </div>

        {/* Metric 3: Total Downloads */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Estimasi Unduhan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
              <Download className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-display">
              {stats.totalDownloadsEst}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Kumulatif dari semua kanal
            </p>
          </div>
        </div>

        {/* Metric 4: System Status */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Status Sistem
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-lg font-black text-emerald-600 dark:text-emerald-400 font-display">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Optimal</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Update: {stats.latestUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Main Apps Table Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Table Header & Search Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Daftar Aplikasi APK
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daftar seluruh berkas APK yang tersedia dan dipublikasikan di katalog.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aplikasi..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <Link href="/admin/apps/new">
              <Button size="sm" variant="primary" className="shrink-0 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Aplikasi</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Versi</th>
                <th className="py-3.5 px-4">Ukuran</th>
                <th className="py-3.5 px-4">Developer</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Memuat data aplikasi...
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada aplikasi yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* App Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <AppIcon
                          type={app.iconType}
                          iconUrl={app.iconUrl}
                          colorClass={app.iconColor}
                          size="sm"
                          className="h-9 w-9 rounded-xl shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {app.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {app.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="py-4 px-4">
                      <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-semibold text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                        {app.category}
                      </span>
                    </td>

                    {/* Version */}
                    <td className="py-4 px-4 font-mono text-slate-700 dark:text-slate-300">
                      v{app.version}
                    </td>

                    {/* Size */}
                    <td className="py-4 px-4 font-mono text-slate-500 dark:text-slate-400">
                      {app.fileSize}
                    </td>

                    {/* Developer */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      {app.developer}
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{app.rating.toFixed(1)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/apps/${app.id}/edit`}>
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors"
                            title="Edit deskripsi & info"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeleteTargetApp(app)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                          title="Hapus aplikasi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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
                Apakah Anda yakin ingin menghapus <strong>{deleteTargetApp.name}</strong> dari katalog? Tindakan ini tidak dapat dibatalkan.
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
