"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  History,
  Link as LinkIcon,
  FolderArchive,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  FileText,
  Smartphone,
  Sparkles,
  ArrowRight,
  HardDrive,
  Layers,
} from "lucide-react";
import { AppItem } from "@/types/store";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { clearCatalogSessionCache } from "@/context/CatalogContext";

interface GithubAssetItem {
  id: number;
  name: string;
  size: number;
  formattedSize: string;
  downloadUrl: string;
  downloadCount: number;
  releaseTag: string;
  createdAt: string;
}

interface NewVersionFormProps {
  preselectedAppId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NewVersionForm({
  preselectedAppId,
  onSuccess,
  onCancel,
}: NewVersionFormProps) {
  const router = useRouter();

  // Daftar aplikasi yang tersedia
  const [apps, setApps] = useState<AppItem[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>(preselectedAppId || "");
  const [loadingApps, setLoadingApps] = useState(true);

  // Form states
  const [version, setVersion] = useState("");
  const [apkUrl, setApkUrl] = useState("");
  const [apkFileName, setApkFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [changelog, setChangelog] = useState("");

  // Submitting state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sumber APK: "github-link" | "direct-upload"
  const [sourceMode, setSourceMode] = useState<"github-link" | "direct-upload">("github-link");

  // GitHub Assets Picker state
  const [githubAssets, setGithubAssets] = useState<GithubAssetItem[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [showAssetsPicker, setShowAssetsPicker] = useState(false);

  // Direct upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ambil daftar aplikasi
  useEffect(() => {
    let isCancelled = false;
    const fetchApps = async () => {
      try {
        setLoadingApps(true);
        const res = await fetch("/api/admin/apps");
        const json = await res.json();
        if (!isCancelled && res.ok && json.success) {
          const list = json.data || [];
          setApps(list);
          if (!selectedAppId && list.length > 0) {
            setSelectedAppId(preselectedAppId || list[0].id);
          }
        }
      } catch {
        if (!isCancelled) {
          setErrorMsg("Gagal memuat daftar aplikasi dari database.");
        }
      } finally {
        if (!isCancelled) setLoadingApps(false);
      }
    };
    fetchApps();
    return () => {
      isCancelled = true;
    };
  }, [preselectedAppId, selectedAppId]);

  // Aplikasi aktif yang dipilih
  const currentApp = apps.find((a) => a.id === selectedAppId) || null;

  // Saran penomoran versi berikutnya saat aplikasi dipilih
  useEffect(() => {
    if (currentApp?.version && !version) {
      const parts = currentApp.version.split(".");
      if (parts.length === 3) {
        const patch = parseInt(parts[2], 10);
        if (!isNaN(patch)) {
          setVersion(`${parts[0]}.${parts[1]}.${patch + 1}`);
        }
      } else if (parts.length === 2) {
        const minor = parseInt(parts[1], 10);
        if (!isNaN(minor)) {
          setVersion(`${parts[0]}.${minor + 1}`);
        }
      }
    }
  }, [currentApp, version]);

  // Fungsi helper kalkulasi saran versi
  const getSuggestedVersion = (type: "patch" | "minor"): string => {
    if (!currentApp?.version) return "1.0.1";
    const parts = currentApp.version.split(".");
    if (parts.length >= 3) {
      const major = parseInt(parts[0], 10) || 1;
      const minor = parseInt(parts[1], 10) || 0;
      const patch = parseInt(parts[2], 10) || 0;
      return type === "patch"
        ? `${major}.${minor}.${patch + 1}`
        : `${major}.${minor + 1}.0`;
    }
    if (parts.length === 2) {
      const major = parseInt(parts[0], 10) || 1;
      const minor = parseInt(parts[1], 10) || 0;
      return type === "patch" ? `${major}.${minor}.1` : `${major}.${minor + 1}.0`;
    }
    return `${currentApp.version}.1`;
  };

  // Ambil daftar aset dari GitHub Releases / Actions
  const fetchGithubAssets = async () => {
    setIsLoadingAssets(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/github-assets");
      const json = await res.json();
      if (res.ok && json.success) {
        setGithubAssets(json.data || []);
        setShowAssetsPicker(true);
      } else {
        throw new Error(json.message || "Gagal mengambil aset rilis dari GitHub.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat aset GitHub.";
      setErrorMsg(msg);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Pilih berkas dari daftar aset GitHub Action
  const handleSelectGithubAsset = (asset: GithubAssetItem) => {
    setApkUrl(asset.downloadUrl);
    setApkFileName(asset.name);
    setFileSize(asset.formattedSize);
    setShowAssetsPicker(false);
    setErrorMsg(null);

    // Coba deteksi nomor versi otomatis dari nama berkas (misal cashflow-v1.0.2.apk)
    const match = asset.name.match(/v?(\d+\.\d+(?:\.\d+)?)/i);
    if (match && match[1]) {
      setVersion(match[1]);
    }
  };

  // Proses upload berkas langsung (fallback atau build lokal)
  const processDirectFile = async (file: File) => {
    setErrorMsg(null);

    if (!file.name.toLowerCase().endsWith(".apk")) {
      setErrorMsg("Format berkas tidak valid. Hanya berkas berekstensi .apk yang didukung.");
      return;
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const formatted = `${sizeInMb} MB`;
    setFileSize(formatted);
    setApkFileName(file.name);

    // Deteksi nomor versi dari nama berkas lokal
    const match = file.name.match(/v?(\d+\.\d+(?:\.\d+)?)/i);
    if (match && match[1]) {
      setVersion(match[1]);
    }

    setUploadProgress(20);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 85) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 15;
      });
    }, 120);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "x-file-name": encodeURIComponent(file.name),
          "x-file-type": "apk",
          "Content-Type": "application/octet-stream",
        },
        body: file,
      });

      clearInterval(progressInterval);
      const text = await res.text();
      let json: { success?: boolean; message?: string; data?: { fileName?: string; fileSize?: string; downloadUrl?: string } };
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Gagal mengunggah berkas (${res.status}): ${text.slice(0, 80)}`);
      }

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mengunggah berkas ke penyimpanan GitHub.");
      }

      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(null);
        if (json.data?.downloadUrl) {
          setApkUrl(json.data.downloadUrl);
        }
        if (json.data?.fileName) {
          setApkFileName(json.data.fileName);
        }
        if (json.data?.fileSize) {
          setFileSize(json.data.fileSize);
        }
      }, 300);
    } catch (err: unknown) {
      setUploadProgress(null);
      const msg = err instanceof Error ? err.message : "Terjadi kegagalan saat proses upload.";
      setErrorMsg(msg);
    }
  };

  // Submit Rilis Versi Baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedAppId) {
      setErrorMsg("Pilih aplikasi yang akan diperbarui.");
      return;
    }

    if (!version.trim()) {
      setErrorMsg("Nomor versi baru wajib diisi (misal: 1.0.1).");
      return;
    }

    if (!apkUrl.trim()) {
      setErrorMsg("Tautan berkas APK dari GitHub Action wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/apps/new-version", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId: selectedAppId,
          version: version.trim(),
          apkUrl: apkUrl.trim(),
          apkFileName: apkFileName.trim() || undefined,
          fileSize: fileSize.trim() || undefined,
          changelog: changelog.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menerbitkan versi baru aplikasi.");
      }

      clearCatalogSessionCache();
      setSuccessMsg(
        `Versi v${version.trim()} untuk aplikasi "${currentApp?.name}" berhasil dirilis!`
      );

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/admin/apps");
          router.refresh();
        }
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan komunikasi dengan server.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Alert Error */}
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <div className="space-y-1">
            <span className="font-bold">Gagal Menerbitkan Versi</span>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Alert Success */}
      {successMsg && (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-4 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <div className="space-y-1">
            <span className="font-bold">Berhasil!</span>
            <p>{successMsg}</p>
          </div>
        </div>
      )}

      {/* 1. Pilih Aplikasi Target */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <span>1. Pilih Aplikasi yang Akan Diperbarui</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih aplikasi terdaftar untuk menambahkan versi APK baru. Versi lama akan otomatis tersimpan di riwayat unduhan.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-primary">
            Aplikasi Terdaftar
          </span>
        </div>

        {loadingApps ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Memuat daftar aplikasi...
          </div>
        ) : apps.length === 0 ? (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Belum ada aplikasi yang terdaftar. Daftarkan aplikasi baru terlebih dahulu.</span>
          </div>
        ) : (
          <div className="space-y-3">
            <label htmlFor="app-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih Aplikasi Target:
            </label>
            <select
              id="app-select"
              value={selectedAppId}
              onChange={(e) => {
                setSelectedAppId(e.target.value);
                setVersion("");
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            >
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — Versi Aktif: v{a.version} ({a.category})
                </option>
              ))}
            </select>

            {/* Banner Info Aplikasi Aktif */}
            {currentApp && (
              <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/30 p-3.5 transition-all">
                <AppIcon
                  type={currentApp.iconType}
                  iconUrl={currentApp.iconUrl}
                  colorClass={currentApp.iconColor}
                  size="sm"
                  className="h-10 w-10 rounded-xl shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentApp.name}
                    </span>
                    <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-bold">
                      v{currentApp.version} Aktif
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      {currentApp.fileSize}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Berkas saat ini: <code className="font-mono text-slate-600 dark:text-slate-300">{currentApp.apkFileName || `${currentApp.id}.apk`}</code>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Nomor Versi Baru */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <span>2. Nomor Versi Baru (Manual)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tentukan nomor versi rilis baru sesuai standar semantik (contoh: 1.0.1 atau 1.1.0).
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Contoh: 1.0.1"
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono font-bold"
            />

            {/* Quick Suggestion Chips */}
            {currentApp?.version && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setVersion(getSuggestedVersion("patch"))}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
                  title="Naikkan versi patch (+0.0.1)"
                >
                  +Patch (v{getSuggestedVersion("patch")})
                </button>
                <button
                  type="button"
                  onClick={() => setVersion(getSuggestedVersion("minor"))}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
                  title="Naikkan versi minor (+0.1.0)"
                >
                  +Minor (v{getSuggestedVersion("minor")})
                </button>
              </div>
            )}
          </div>

          {currentApp?.version && version.trim() && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Transisi rilis:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                v{currentApp.version}
              </span>
              <ArrowRight className="h-3 w-3 text-slate-400" />
              <span className="font-mono font-bold text-primary">v{version.trim()}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Tautan Berkas APK dari GitHub Action */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              <span>3. Tautan Berkas APK dari GitHub Action</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tetap menggunakan tautan rilis GitHub Action agar unduhan stabil, cepat, dan terhubung dengan repositori.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setSourceMode("github-link")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
                sourceMode === "github-link"
                  ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground"
              )}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Tautan GitHub Action</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("direct-upload")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
                sourceMode === "direct-upload"
                  ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground"
              )}
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Unggah Berkas Langsung</span>
            </button>
          </div>
        </div>

        {sourceMode === "github-link" ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="apk-github-url" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Tautan Unduh APK GitHub Action / Release:
              </label>
              <button
                type="button"
                onClick={fetchGithubAssets}
                disabled={isLoadingAssets}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors"
              >
                <RefreshCw className={cn("h-3 w-3", isLoadingAssets && "animate-spin")} />
                <span>{isLoadingAssets ? "Memuat Aset..." : "Pilih dari Aset GitHub"}</span>
              </button>
            </div>

            {/* Picker Aset GitHub Action Modal/Dropdown */}
            {showAssetsPicker && (
              <div className="space-y-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 p-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FolderArchive className="h-4 w-4 text-primary" />
                    <span>Aset APK di Repositori GitHub Action:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAssetsPicker(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {githubAssets.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-1">
                    Tidak ditemukan aset APK pada repositori GitHub Action saat ini.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {githubAssets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => handleSelectGithubAsset(asset)}
                        className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary cursor-pointer transition-all hover:shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {asset.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Ukuran: {asset.formattedSize} • Rilis: {asset.releaseTag} • {asset.downloadCount} unduhan
                          </p>
                        </div>
                        <span className="shrink-0 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Gunakan Link Ini
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <input
                id="apk-github-url"
                type="url"
                required
                value={apkUrl}
                onChange={(e) => {
                  setApkUrl(e.target.value);
                  try {
                    const parts = e.target.value.split("/");
                    const last = parts[parts.length - 1];
                    if (last && last.toLowerCase().includes(".apk")) {
                      const cleanLast = decodeURIComponent(last.split("?")[0]);
                      setApkFileName(cleanLast);
                      const match = cleanLast.match(/v?(\d+\.\d+(?:\.\d+)?)/i);
                      if (match && match[1] && !version) {
                        setVersion(match[1]);
                      }
                    }
                  } catch {}
                }}
                placeholder="https://github.com/Aldikurniawan19/app-release/releases/download/.../app-release.apk"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
              />

              {/* Status URL Preview */}
              {apkUrl.trim() && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-[11px] text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Tautan GitHub Action siap digunakan</span>
                  </div>
                  <a
                    href={apkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1 text-[10px] font-bold underline hover:opacity-80"
                  >
                    <span>Uji Unduh</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Direct Drag and Drop APK Zone */
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".apk"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processDirectFile(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  processDirectFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer select-none",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-slate-300 dark:border-slate-700 hover:border-primary/60 dark:hover:border-primary/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
              )}
            >
              {uploadProgress !== null ? (
                <div className="w-full max-w-xs space-y-3 py-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Mengunggah APK ke penyimpanan GitHub...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full bg-primary transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-slate-800 text-primary group-hover:scale-110 transition-transform shadow-inner">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tarik & letakkan berkas <span className="text-primary font-mono">.apk</span> baru di sini
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      atau klik untuk memilih berkas dari komputer (akan disimpan ke GitHub Releases)
                    </p>
                  </div>
                </>
              )}
            </div>

            {apkUrl && (
              <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">Berkas berhasil diunggah: <strong>{apkFileName}</strong></span>
                </div>
                <span className="shrink-0 font-mono text-[11px] font-bold">{fileSize}</span>
              </div>
            )}
          </div>
        )}

        {/* Metadata Berkas (Nama Berkas & Ukuran) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Nama Berkas APK:
            </label>
            <input
              type="text"
              value={apkFileName}
              onChange={(e) => setApkFileName(e.target.value)}
              placeholder="Contoh: cashflow-v1.0.1.apk"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Ukuran Berkas:
            </label>
            <input
              type="text"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="Contoh: 82.5 MB"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. Catatan Perubahan (Changelog) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="changelog-textarea" className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span>4. Catatan Perubahan Versi Baru (Changelog)</span>
          </label>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Ditampilkan di tab Riwayat Versi
          </span>
        </div>

        <textarea
          id="changelog-textarea"
          value={changelog}
          onChange={(e) => setChangelog(e.target.value)}
          rows={3}
          placeholder="Contoh: Perbaikan bug pada perhitungan saldo, peningkatan performa sinkronisasi, dukungan Android 14..."
          className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-3 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
        />

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Catatan ini akan tersimpan permanen bersama rilis ini dan dapat dibaca oleh pengguna saat melihat riwayat pembaruan di halaman katalog aplikasi.
        </p>
      </div>

      {/* Action Footer Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              router.push("/admin/apps");
            }
          }}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={submitting || !selectedAppId || !version.trim() || !apkUrl.trim()}
          className="shadow-md shadow-primary/25 min-w-[180px]"
        >
          <UploadCloud className="h-4 w-4" />
          <span>{submitting ? "Menerbitkan..." : "Terbitkan Versi Baru"}</span>
        </Button>
      </div>
    </form>
  );
}
