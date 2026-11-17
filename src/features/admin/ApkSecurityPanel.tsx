"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Clock,
  AlertCircle,
  ScanSearch,
} from "lucide-react";
import type { ApkSecurityReportDetail, ApkSecuritySummary } from "@/types/security";
import { Button } from "@/components/ui/Button";
import {
  formatScanDate,
  getSecurityStatusPresentation,
} from "@/lib/security-format";
import { cn } from "@/lib/utils";
import { clearCatalogSessionCache } from "@/context/CatalogContext";

interface ApkSecurityPanelProps {
  appId: string;
  appName: string;
  version: string;
  apkUrl?: string | null;
  apkFileName?: string | null;
  knownSha256?: string | null;
  initialSummary?: ApkSecuritySummary;
  onScanUpdated?: (summary: ApkSecuritySummary) => void;
}

/**
 * Panel verifikasi keamanan APK untuk Admin.
 * Memicu pemindaian manual lewat VirusTotal API v3 dan memantau statusnya.
 */
export function ApkSecurityPanel({
  appId,
  appName,
  version,
  apkUrl,
  apkFileName,
  knownSha256,
  initialSummary,
  onScanUpdated,
}: ApkSecurityPanelProps) {
  const [report, setReport] = useState<ApkSecurityReportDetail | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSha, setCopiedSha] = useState(false);

  const effectiveSummary: ApkSecuritySummary | null =
    report ?? initialSummary ?? null;

  const fetchStatus = useCallback(
    async (syncPending: boolean) => {
      try {
        if (syncPending) setSyncing(true);
        const query = new URLSearchParams({
          appId,
          version,
          sync: syncPending ? "1" : "0",
        });
        const res = await fetch(`/api/admin/apps/scan?${query.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setReport(json.data || null);
          if (json.data) {
            clearCatalogSessionCache();
            onScanUpdated?.(json.data);
          }
        }
      } catch {
        // Biarkan state sebelumnya tetap tampil jika koneksi gagal sementara
      } finally {
        setLoadingInitial(false);
        setSyncing(false);
      }
    },
    [appId, version, onScanUpdated]
  );

  useEffect(() => {
    fetchStatus(true);
  }, [fetchStatus]);

  // Polling berkala saat hasil VirusTotal masih berada di antrean ("pending")
  useEffect(() => {
    if (effectiveSummary?.status !== "pending") return;

    const timer = setInterval(() => {
      fetchStatus(true);
    }, 8000);

    return () => clearInterval(timer);
  }, [effectiveSummary?.status, fetchStatus]);

  const handleRunScan = async () => {
    setErrorMsg(null);
    setScanning(true);
    try {
      const res = await fetch("/api/admin/apps/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId,
          version,
          apkUrl: apkUrl || undefined,
          apkFileName: apkFileName || undefined,
          knownSha256: knownSha256 || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memindai berkas APK di VirusTotal.");
      }

      if (json.data) {
        setReport(json.data);
        clearCatalogSessionCache();
        onScanUpdated?.(json.data);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghubungi layanan VirusTotal.";
      setErrorMsg(msg);
    } finally {
      setScanning(false);
    }
  };

  const handleCopySha = async () => {
    const hash = effectiveSummary?.sha256 || knownSha256;
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 1800);
    } catch {
      // Abaikan jika browser memblokir clipboard
    }
  };

  const presentation = getSecurityStatusPresentation(effectiveSummary, version);
  const displayHash = effectiveSummary?.sha256 || knownSha256;

  const renderStatusIcon = () => {
    if (effectiveSummary?.status === "clean") {
      return <ShieldCheck className={cn("h-5 w-5 shrink-0", presentation.iconClass)} aria-hidden="true" />;
    }
    if (effectiveSummary?.status === "pending") {
      return <Clock className={cn("h-5 w-5 shrink-0", presentation.iconClass)} aria-hidden="true" />;
    }
    if (
      effectiveSummary?.status === "malicious" ||
      effectiveSummary?.status === "suspicious"
    ) {
      return <ShieldAlert className={cn("h-5 w-5 shrink-0", presentation.iconClass)} aria-hidden="true" />;
    }
    return <Shield className={cn("h-5 w-5 shrink-0", presentation.iconClass)} aria-hidden="true" />;
  };

  return (
    <div className="rounded-2xl border border-border bg-background-soft p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-sm">
            {renderStatusIcon()}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-foreground font-display">
                Verifikasi Keamanan APK (VirusTotal)
              </h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                  presentation.badgeClass
                )}
              >
                {presentation.label}
              </span>
            </div>

            <p className="text-xs text-foreground-muted leading-relaxed">
              {loadingInitial && !effectiveSummary
                ? `Memuat status pemindaian untuk ${appName}...`
                : presentation.summaryText}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {effectiveSummary?.status === "pending" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={syncing || scanning}
              onClick={() => fetchStatus(true)}
              className="h-9 px-3 text-xs"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", syncing && "animate-spin")}
                aria-hidden="true"
              />
              <span>{syncing ? "Mengecek..." : "Cek Status"}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={scanning || (!apkUrl && !displayHash)}
            onClick={handleRunScan}
            className="h-9 px-4 text-xs shadow-sm"
          >
            {scanning ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <ScanSearch className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{scanning ? "Memindai..." : "Pindai Sekarang"}</span>
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-danger-subtle p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
          <p className="leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {(displayHash || effectiveSummary) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl border border-border bg-surface p-3.5 text-xs">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-semibold text-foreground-muted">
              Checksum SHA-256
            </span>
            {displayHash ? (
              <div className="flex items-center gap-2">
                <code className="truncate font-mono text-[11px] text-foreground bg-background-soft px-2 py-1 rounded-md border border-border flex-1">
                  {displayHash}
                </code>
                <button
                  type="button"
                  onClick={handleCopySha}
                  aria-label="Salin hash SHA-256"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted hover:text-primary hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {copiedSha ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-foreground-subtle">
                Hash akan dihitung otomatis saat pemindaian dijalankan.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="space-y-0.5 text-left sm:text-right">
              <span className="block text-[11px] font-semibold text-foreground-muted">
                Terakhir Dipindai
              </span>
              <span className="block font-mono text-[11px] text-foreground">
                {effectiveSummary?.scannedAt
                  ? formatScanDate(effectiveSummary.scannedAt)
                  : "Belum selesai"}
              </span>
            </div>

            {effectiveSummary?.permalink && (
              <a
                href={effectiveSummary.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background-soft px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary-subtle transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>VirusTotal</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
