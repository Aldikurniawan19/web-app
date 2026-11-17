"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Clock,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  FileCheck2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { AppItem } from "@/types/store";
import type { ApkSecurityReportDetail } from "@/types/security";
import {
  formatScanDate,
  getEngineCategoryLabel,
  getSecurityStatusPresentation,
} from "@/lib/security-format";
import { cn } from "@/lib/utils";

interface AppSecurityReportProps {
  app: AppItem;
}

const DEFAULT_VISIBLE_ENGINES = 9;

/**
 * Tampilan laporan verifikasi keamanan APK untuk pengunjung publik.
 * Dirancang agar mudah dipahami pengguna awam maupun pengguna teknis (SHA-256 & vendor AV).
 */
export function AppSecurityReport({ app }: AppSecurityReportProps) {
  const [detail, setDetail] = useState<ApkSecurityReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedSha, setCopiedSha] = useState(false);
  const [showAllEngines, setShowAllEngines] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setDetail(null);
    setShowAllEngines(false);

    const params = new URLSearchParams({
      appId: app.id,
      version: app.version,
    });

    fetch(`/api/apps/security?${params.toString()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!isCancelled && json.success) {
          setDetail(json.data || null);
        }
      })
      .catch(() => {
        // Tetap gunakan ringkasan dari app.securityScan jika fetch tambahan gagal
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [app.id, app.version]);

  const activeScan = detail ?? app.securityScan ?? null;
  const presentation = getSecurityStatusPresentation(activeScan, app.version);
  const engines = detail?.engineHighlights || [];
  const visibleEngines = showAllEngines
    ? engines
    : engines.slice(0, DEFAULT_VISIBLE_ENGINES);

  const handleCopySha = async () => {
    if (!activeScan?.sha256) return;
    try {
      await navigator.clipboard.writeText(activeScan.sha256);
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 1800);
    } catch {
      // Abaikan jika browser membatasi akses clipboard
    }
  };

  const renderStatusIcon = () => {
    if (activeScan?.status === "clean") {
      return (
        <ShieldCheck
          className={cn("h-7 w-7", presentation.iconClass)}
          aria-hidden="true"
        />
      );
    }
    if (activeScan?.status === "pending") {
      return (
        <Clock
          className={cn("h-7 w-7", presentation.iconClass)}
          aria-hidden="true"
        />
      );
    }
    if (
      activeScan?.status === "malicious" ||
      activeScan?.status === "suspicious"
    ) {
      return (
        <ShieldAlert
          className={cn("h-7 w-7", presentation.iconClass)}
          aria-hidden="true"
        />
      );
    }
    return (
      <Shield
        className={cn("h-7 w-7", presentation.iconClass)}
        aria-hidden="true"
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Ringkasan Status Utama */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5",
            presentation.panelClass
          )}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
              {renderStatusIcon()}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-foreground font-display">
                  {presentation.headline}
                </h2>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold",
                    presentation.badgeClass
                  )}
                >
                  {presentation.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                {loading && !activeScan
                  ? "Memuat data verifikasi keamanan aplikasi..."
                  : presentation.summaryText}
              </p>
            </div>
          </div>

          {activeScan?.permalink && (
            <a
              href={activeScan.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-xs font-bold text-primary shadow-sm transition-colors hover:bg-primary-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>Buka Bukti di VirusTotal</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        {/* 3 Metrik Ringkas agar Pengunjung Mudah Memahami Hasil */}
        {activeScan && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background-soft p-4 space-y-1">
              <span className="block text-xs text-foreground-muted">
                Temuan Ancaman
              </span>
              <p className="font-mono text-lg font-bold text-foreground">
                {activeScan.status === "pending"
                  ? "Dalam antrean"
                  : `${activeScan.maliciousCount + activeScan.suspiciousCount} / ${activeScan.totalEngines} Mesin`}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background-soft p-4 space-y-1">
              <span className="block text-xs text-foreground-muted">
                Versi Terperiksa
              </span>
              <p className="font-mono text-lg font-bold text-foreground">
                v{activeScan.version}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background-soft p-4 space-y-1">
              <span className="block text-xs text-foreground-muted">
                Tanggal Pemeriksaan
              </span>
              <p className="text-sm sm:text-base font-bold text-foreground">
                {activeScan.scannedAt
                  ? formatScanDate(activeScan.scannedAt)
                  : "Menunggu hasil"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Daftar Hasil Mesin Antivirus Utama */}
      {engines.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold text-foreground font-display">
                Hasil Pemeriksaan Mesin Antivirus
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Ringkasan pengecekan dari mesin keamanan terkemuka melalui VirusTotal.
              </p>
            </div>

            {activeScan && (
              <span className="font-mono text-xs font-semibold text-foreground-muted">
                {activeScan.undetectedCount} dari {activeScan.totalEngines} mesin dinyatakan aman
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEngines.map((engine) => {
              const cat = getEngineCategoryLabel(engine.category);
              return (
                <div
                  key={engine.engineName}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background-soft px-3.5 py-2.5 text-xs"
                >
                  <span className="truncate font-semibold text-foreground">
                    {engine.engineName}
                  </span>

                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 font-semibold",
                      cat.isSafe ? "text-emerald-700" : "text-rose-700"
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{cat.label}</span>
                  </span>
                </div>
              );
            })}
          </div>

          {engines.length > DEFAULT_VISIBLE_ENGINES && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setShowAllEngines((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {showAllEngines ? (
                  <>
                    <span>Tampilkan Lebih Sedikit</span>
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <span>Lihat Semua ({engines.length} Mesin)</span>
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Informasi Keaslian Berkas (SHA-256) */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background-soft text-primary">
            <FileCheck2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground font-display">
              Verifikasi Keaslian Berkas (SHA-256)
            </h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Kode sidik jari SHA-256 ini membantu memastikan berkas APK yang Anda unduh identik dengan berkas yang telah dipindai.
            </p>
          </div>
        </div>

        {activeScan?.sha256 ? (
          <div className="rounded-xl border border-border bg-background-soft p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs text-foreground-muted">
              <span>Nama Berkas:</span>
              <span className="font-mono font-semibold text-foreground truncate">
                {detail?.apkFileName || app.apkFileName || `${app.id}-v${app.version}.apk`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs text-foreground">
                {activeScan.sha256}
              </code>
              <button
                type="button"
                onClick={handleCopySha}
                aria-label="Salin kode SHA-256"
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {copiedSha ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="rounded-xl border border-border bg-background-soft p-3.5 text-xs text-foreground-muted">
            Kode SHA-256 akan otomatis tercatat setelah admin menjalankan pemindaian VirusTotal untuk versi ini.
          </p>
        )}
      </div>
    </div>
  );
}
