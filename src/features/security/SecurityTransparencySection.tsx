"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Clock,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  FileCheck2,
  HardDrive,
} from "lucide-react";
import type { AppItem } from "@/types/store";
import type { ApkSecurityReportDetail } from "@/types/security";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { ShimmerTitleText } from "@/components/ui/ShimmerTitleText";
import {
  formatScanDate,
  getEngineCategoryLabel,
  getSecurityStatusPresentation,
} from "@/lib/security-format";
import { cn } from "@/lib/utils";

interface SecurityTransparencySectionProps {
  apps: AppItem[];
  isLoading?: boolean;
  onOpenSecurityDetail: (app: AppItem) => void;
  onOpenAppDetail?: (app: AppItem) => void;
}

const PREVIEW_ENGINES_LIMIT = 6;

/**
 * Section halaman utama dengan layout 2 kolom untuk contoh satu aplikasi:
 * Kiri: Bukti data hasil cek virus (VirusTotal, vendor AV, SHA-256).
 * Kanan: Kartu informasi aplikasi yang diverifikasi.
 */
export function SecurityTransparencySection({
  apps,
  isLoading = false,
  onOpenSecurityDetail,
  onOpenAppDetail,
}: SecurityTransparencySectionProps) {
  // Prioritaskan satu aplikasi contoh yang sudah memiliki hasil scan VirusTotal bersih
  const featuredApp = useMemo(() => {
    if (apps.length === 0) return null;
    return (
      apps.find((app) => app.securityScan?.status === "clean") ||
      apps.find((app) => Boolean(app.securityScan)) ||
      apps[0]
    );
  }, [apps]);

  const [detail, setDetail] = useState<ApkSecurityReportDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);

  useEffect(() => {
    if (!featuredApp) {
      setDetail(null);
      return;
    }

    let isCancelled = false;
    setLoadingDetail(true);

    const params = new URLSearchParams({
      appId: featuredApp.id,
      version: featuredApp.version,
    });

    fetch(`/api/apps/security?${params.toString()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!isCancelled && json.success) {
          setDetail(json.data || null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setLoadingDetail(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [featuredApp?.id, featuredApp?.version, featuredApp?.securityScan?.status]);

  const activeScan = detail ?? featuredApp?.securityScan ?? null;
  const presentation = getSecurityStatusPresentation(
    activeScan,
    featuredApp?.version
  );
  const enginePreview = (detail?.engineHighlights || []).slice(
    0,
    PREVIEW_ENGINES_LIMIT
  );

  const handleCopySha = async () => {
    if (!activeScan?.sha256) return;
    try {
      await navigator.clipboard.writeText(activeScan.sha256);
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 1800);
    } catch {
      // Abaikan jika browser memblokir clipboard
    }
  };

  const renderStatusIcon = () => {
    if (activeScan?.status === "clean") {
      return (
        <ShieldCheck
          className={cn("h-6 w-6", presentation.iconClass)}
          aria-hidden="true"
        />
      );
    }
    if (activeScan?.status === "pending") {
      return (
        <Clock
          className={cn("h-6 w-6", presentation.iconClass)}
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
          className={cn("h-6 w-6", presentation.iconClass)}
          aria-hidden="true"
        />
      );
    }
    return (
      <Shield
        className={cn("h-6 w-6", presentation.iconClass)}
        aria-hidden="true"
      />
    );
  };

  return (
    <section
      id="keamanan"
      aria-labelledby="security-section-heading"
      className="scroll-mt-16 py-12 sm:py-16 bg-background w-full border-t border-border"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-success-subtle px-3 py-1 text-xs font-bold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            <span>Verifikasi Keamanan VirusTotal</span>
          </div>

          <h2
            id="security-section-heading"
            className="text-2xl font-extrabold tracking-normal sm:text-3xl font-display select-none py-0.5"
          >
            <span className="inline-block text-3d-bubble-main">Bukti Aplikasi</span>{" "}
            <ShimmerTitleText>Bebas Virus</ShimmerTitleText>
          </h2>

          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
            Setiap berkas APK diperiksa menggunakan multi-mesin antivirus dan diverifikasi sidik jari SHA-256 sebelum dipublikasikan ke katalog.
          </p>
        </div>

        {/* Konten 2 Kolom: Mobile (Atas: Aplikasi, Bawah: Bukti Cek) | Desktop (Kiri: Bukti Cek, Kanan: Aplikasi) */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="order-2 lg:order-1 lg:col-span-7 h-72 rounded-2xl border border-border bg-surface p-6 animate-pulse" />
            <div className="order-1 lg:order-2 lg:col-span-5 h-72 rounded-2xl border border-border bg-surface p-6 animate-pulse" />
          </div>
        ) : !featuredApp ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-xs sm:text-sm text-foreground-muted">
            Belum ada aplikasi APK yang tersedia untuk ditampilkan hasil pemindaiannya.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
            {/* BAGIAN KIRI (Desktop) / BAWAH (Mobile): Bukti Data Hasil Cek */}
            <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-between gap-5 rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
              <div className="space-y-4 sm:space-y-5">
                {/* Banner Status Hasil Cek */}
                <div
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4",
                    presentation.panelClass
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-sm">
                      {renderStatusIcon()}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-foreground font-display">
                          {presentation.headline}
                        </h3>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                            presentation.badgeClass
                          )}
                        >
                          {presentation.label}
                        </span>
                      </div>
                      <p className="text-xs text-foreground-muted leading-relaxed">
                        {loadingDetail && !activeScan
                          ? "Memuat hasil pemeriksaan VirusTotal..."
                          : presentation.summaryText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Metrik Bukti Ringkas */}
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-background-soft px-3.5 py-3 space-y-0.5">
                    <span className="block text-[11px] text-foreground-muted">
                      Temuan Virus
                    </span>
                    <p className="font-mono text-sm sm:text-base font-bold text-foreground">
                      {activeScan
                        ? activeScan.status === "pending"
                          ? "Dalam Antrean"
                          : `${activeScan.maliciousCount + activeScan.suspiciousCount} / ${activeScan.totalEngines} Mesin`
                        : "Belum Dicek"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background-soft px-3.5 py-3 space-y-0.5">
                    <span className="block text-[11px] text-foreground-muted">
                      Tanggal Pemeriksaan
                    </span>
                    <p className="text-sm font-bold text-foreground">
                      {activeScan?.scannedAt
                        ? formatScanDate(activeScan.scannedAt)
                        : "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background-soft px-3.5 py-3 space-y-0.5">
                    <span className="block text-[11px] text-foreground-muted">
                      Mesin Pemeriksa
                    </span>
                    <p className="text-sm font-bold text-foreground">
                      VirusTotal API v3
                    </p>
                  </div>
                </div>

                {/* Cuplikan Hasil Vendor Antivirus */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                    <span className="font-bold text-foreground">
                      Cuplikan Hasil Mesin Antivirus
                    </span>
                    {activeScan && activeScan.totalEngines > 0 && (
                      <span className="font-mono text-[11px] text-foreground-muted">
                        {activeScan.undetectedCount} dari {activeScan.totalEngines} mesin bersih
                      </span>
                    )}
                  </div>

                  {enginePreview.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {enginePreview.map((engine) => {
                        const cat = getEngineCategoryLabel(engine.category);
                        return (
                          <div
                            key={engine.engineName}
                            className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background-soft px-3 py-2 text-xs"
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
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-background-soft px-4 py-3.5 text-xs text-foreground-muted">
                      Daftar hasil vendor antivirus akan tampil otomatis setelah pemindaian VirusTotal dijalankan untuk contoh aplikasi ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Kiri: Checksum SHA-256 + Tautan Bukti Resmi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-4">
                {activeScan?.sha256 ? (
                  <div className="flex w-full sm:w-auto sm:flex-1 min-w-0 items-center gap-2 rounded-xl border border-border bg-background-soft px-3 py-2 sm:py-1.5">
                    <FileCheck2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-[11px] font-semibold text-foreground-muted shrink-0">
                      SHA-256
                    </span>
                    <code className="truncate font-mono text-[11px] text-foreground flex-1">
                      {activeScan.sha256}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySha}
                      aria-label="Salin hash SHA-256"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-foreground-muted hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {copiedSha ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-foreground-muted">
                    Kode sidik jari SHA-256 belum tersedia.
                  </span>
                )}

                {activeScan?.permalink && (
                  <a
                    href={activeScan.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 text-xs font-bold text-primary hover:bg-primary-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span>Bukti VirusTotal</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>

            {/* BAGIAN KANAN (Desktop) / ATAS (Mobile): Aplikasinya */}
            <aside className="order-1 lg:order-2 lg:col-span-5 flex flex-col justify-between gap-5 rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
              <div className="space-y-4">
                {/* Identitas Aplikasi */}
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                  <AppIcon
                    type={featuredApp.iconType}
                    iconUrl={featuredApp.iconUrl}
                    colorClass={featuredApp.iconColor}
                    size="lg"
                    alt={`Ikon ${featuredApp.name}`}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base sm:text-xl font-bold text-foreground font-display">
                        {featuredApp.name}
                      </h3>
                      <span className="rounded-md bg-primary-subtle px-2.5 py-0.5 text-[11px] font-semibold text-primary shrink-0">
                        {featuredApp.category}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-muted">
                      {featuredApp.developer}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-foreground-muted">
                      <span>v{featuredApp.version}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <HardDrive className="h-3 w-3" aria-hidden="true" />
                        {featuredApp.fileSize}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deskripsi Aplikasi */}
                <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed line-clamp-3">
                  {featuredApp.description}
                </p>

                {/* Metadata Berkas APK */}
                <div className="divide-y divide-border rounded-xl border border-border bg-background-soft px-3.5 text-xs">
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-foreground-muted shrink-0">Berkas Paket</span>
                    <span className="min-w-0 truncate text-right font-mono font-semibold text-foreground">
                      {featuredApp.apkFileName || `${featuredApp.id}-v${featuredApp.version}.apk`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-foreground-muted shrink-0">Pembaruan</span>
                    <span className="text-right font-medium text-foreground">
                      {featuredApp.lastUpdated}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-foreground-muted shrink-0">Total Unduhan</span>
                    <span className="text-right font-semibold text-foreground">
                      {featuredApp.downloadsCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => onOpenSecurityDetail(featuredApp)}
                  className="w-full sm:w-auto sm:flex-1 rounded-xl text-xs"
                >
                  <span>Lihat Laporan Lengkap</span>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>

                {onOpenAppDetail && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => onOpenAppDetail(featuredApp)}
                    className="w-full sm:w-auto rounded-xl text-xs"
                  >
                    <span>Detail Aplikasi</span>
                  </Button>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
