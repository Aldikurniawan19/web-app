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
  HardDrive,
  Calendar,
  AlertCircle,
  Smartphone,
  History,
  ShieldCheck,
  ScanSearch,
} from "lucide-react";
import { AppCategory, AppItem } from "@/types/store";
import { CATEGORIES } from "@/constants/app-store-data";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { NewVersionForm } from "@/features/admin/NewVersionForm";
import { ApkSecurityPanel } from "@/features/admin/ApkSecurityPanel";
import { getSecurityStatusPresentation } from "@/lib/security-format";
import { cn } from "@/lib/utils";
import { clearCatalogSessionCache } from "@/context/CatalogContext";

export default function AdminAppsListPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>("Semua");
  const [deleteTargetApp, setDeleteTargetApp] = useState<AppItem | null>(null);
  const [versionTargetApp, setVersionTargetApp] = useState<AppItem | null>(null);
  const [scanTargetApp, setScanTargetApp] = useState<AppItem | null>(null);
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
        clearCatalogSessionCache();
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
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Kelola Seluruh Aplikasi APK
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publikasikan, edit metadata deskripsi, atau hapus aplikasi dari ekosistem alllprojects.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/apps/new?mode=version">
            <Button variant="secondary" size="sm" className="shadow-sm">
              <History className="h-4 w-4" />
              <span>Upload Versi Baru</span>
            </Button>
          </Link>
          <Link href="/admin/apps/new">
            <Button variant="primary" size="sm" className="shadow-sm shadow-primary/20">
              <Plus className="h-4 w-4" />
              <span>Unggah APK Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, developer, atau deskripsi..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900"
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
          filteredApps.map((app) => {
            const scanUI = getSecurityStatusPresentation(app.securityScan, app.version);
            return (
            <div
              key={app.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all space-y-4"
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
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold",
                        scanUI.badgeClass
                      )}
                    >
                      <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>{scanUI.label}</span>
                    </span>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-primary border border-blue-100">
                      {app.category}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display truncate">
                    {app.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {app.developer}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>
                </div>
              </div>

              {/* Meta stats */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1 font-mono">
                  <HardDrive className="h-3 w-3" />
                  <span>{app.fileSize}</span>
                </div>
                <span className="font-mono">v{app.version}</span>
                <span>{app.downloadsCount}</span>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  {app.lastUpdated}
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setScanTargetApp(app)}
                    className="inline-flex items-center gap-1 h-8 px-2.5 rounded-xl border border-emerald-200 bg-success-subtle text-emerald-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all text-xs font-semibold"
                    title="Pindai atau cek status virus berkas APK lewat VirusTotal"
                  >
                    <ScanSearch className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Pindai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVersionTargetApp(app)}
                    className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold"
                    title="Upload versi baru manual untuk aplikasi ini"
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>Rilis</span>
                  </button>

                  <Link href={`/admin/apps/${app.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeleteTargetApp(app)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Hapus aplikasi"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Delete Modal */}
      {deleteTargetApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 font-display">
                Konfirmasi Hapus Aplikasi
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
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

      {/* Modal Quick Release Versi Baru */}
      {versionTargetApp && (
        <Modal
          isOpen={Boolean(versionTargetApp)}
          onClose={() => setVersionTargetApp(null)}
          title={`Upload Versi Baru: ${versionTargetApp.name}`}
          description={`Rilis versi baru untuk aplikasi ${versionTargetApp.name} (versi saat ini: v${versionTargetApp.version}) menggunakan tautan GitHub Action.`}
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <NewVersionForm
            preselectedAppId={versionTargetApp.id}
            onSuccess={() => {
              setVersionTargetApp(null);
              fetchApps();
            }}
            onCancel={() => setVersionTargetApp(null)}
          />
        </Modal>
      )}
      {/* Modal Verifikasi Keamanan APK (VirusTotal) */}
      {scanTargetApp && (
        <Modal
          isOpen={Boolean(scanTargetApp)}
          onClose={() => setScanTargetApp(null)}
          title={`Cek Keamanan APK: ${scanTargetApp.name}`}
          description={`Pindai berkas ${scanTargetApp.apkFileName || scanTargetApp.name} (v${scanTargetApp.version}) melalui VirusTotal API v3 agar laporan bebas virus tampil di katalog publik.`}
          className="max-w-2xl"
        >
          <ApkSecurityPanel
            appId={scanTargetApp.id}
            appName={scanTargetApp.name}
            version={scanTargetApp.version}
            apkUrl={scanTargetApp.apkUrl}
            apkFileName={scanTargetApp.apkFileName}
            initialSummary={scanTargetApp.securityScan}
            onScanUpdated={(summary) => {
              setApps((prev) =>
                prev.map((item) =>
                  item.id === scanTargetApp.id
                    ? { ...item, securityScan: summary }
                    : item
                )
              );
            }}
          />
        </Modal>
      )}
    </div>
  );
}
