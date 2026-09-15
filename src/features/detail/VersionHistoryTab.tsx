"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  Download,
  FileText,
  ShieldCheck,
  Calendar,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  PackageCheck,
} from "lucide-react";
import { AppItem, AppVersionItem } from "@/types/store";
import { Button } from "@/components/ui/Button";

interface VersionHistoryTabProps {
  app: AppItem;
  onDownload: (app: AppItem) => void;
}

export function VersionHistoryTab({ app, onDownload }: VersionHistoryTabProps) {
  const [versions, setVersions] = useState<AppVersionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchVersions = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await fetch(`/api/apps/versions?appId=${encodeURIComponent(app.id)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVersions(json.data);
      } else {
        setHasError(true);
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [app.id]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleDownloadOldVersion = (v: AppVersionItem) => {
    // Siapkan objek AppItem dengan berkas versi lama untuk diunduh melalui modal
    const versionApp: AppItem = {
      ...app,
      version: v.version,
      fileSize: v.fileSize,
      apkUrl: v.apkUrl,
      apkFileName: v.apkFileName,
      lastUpdated: formatDate(v.createdAt),
    };
    onDownload(versionApp);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-display select-none py-0.5">
              Riwayat Versi Berkas APK
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Semua paket terverifikasi dan aman dipasang</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Unduh versi aplikasi yang sesuai dengan kebutuhan sistem perangkat Anda. Versi sebelumnya tetap disimpan sehingga Anda dapat kembali ke rilis sebelumnya jika diperlukan.
          </p>
        </div>

        {/* 1. Versi Terkini (Aktif) Card */}
        <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/[0.04] to-transparent p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono">
                  v{app.version}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                  Rilis Terbaru (Aktif)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                  <span>{app.fileSize}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Diperbarui {app.lastUpdated}</span>
                </div>
                {app.apkFileName && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-400 truncate max-w-xs">{app.apkFileName}</span>
                  </>
                )}
              </div>
            </div>

            <Button
              size="md"
              variant="primary"
              onClick={() => onDownload(app)}
              className="h-11 px-6 font-semibold shadow-md shadow-primary/20 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Unduh Versi Terbaru</span>
            </Button>
          </div>
        </div>

        {/* 2. Daftar Versi Sebelumnya */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <span>Versi Sebelumnya</span>
              {!isLoading && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  ({versions.length} versi tersimpan)
                </span>
              )}
            </h3>

            <button
              type="button"
              onClick={fetchVersions}
              disabled={isLoading}
              className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 p-1 rounded-md"
              title="Perbarui data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-pulse bg-slate-50/50 dark:bg-slate-800/20"
                >
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && hasError && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 p-4 flex items-center justify-between gap-3 text-xs text-red-700 dark:text-red-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Gagal memuat riwayat versi sebelumnya.</span>
              </div>
              <button
                type="button"
                onClick={fetchVersions}
                className="font-bold underline hover:opacity-80 transition-opacity"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasError && versions.length === 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-8 text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <PackageCheck className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Belum Ada Versi Sebelumnya
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Aplikasi ini saat ini berjalan pada rilis pertama. Ketika pembaruan berkas APK diunggah oleh pengembang, versi lama akan secara otomatis diarsipkan dan dapat diunduh di sini.
              </p>
            </div>
          )}

          {/* Version List */}
          {!isLoading && !hasError && versions.length > 0 && (
            <div className="space-y-3">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 font-mono">
                          v{v.version}
                        </span>
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          {v.fileSize}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          Dirilis {formatDate(v.createdAt)}
                        </span>
                      </div>

                      {v.changelog && (
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                            <FileText className="h-3 w-3 text-primary" />
                            <span>Catatan Perubahan:</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-line pl-4">
                            {v.changelog}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono truncate">
                        <span>Berkas:</span>
                        <span className="text-slate-600 dark:text-slate-400 truncate">{v.apkFileName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownloadOldVersion(v)}
                        className="h-9 px-4 text-xs font-semibold rounded-lg flex items-center gap-1.5 border-slate-200 dark:border-slate-700"
                      >
                        <Download className="h-3.5 w-3.5 text-primary" />
                        <span>Unduh APK v{v.version}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
