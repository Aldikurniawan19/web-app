"use client";

import React, { useState } from "react";
import {
  Download,
  QrCode,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { APP_CONFIG, INSTALLATION_STEPS } from "@/constants/app-data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { QrCodeModal } from "@/features/download/QrCodeModal";

export function DownloadSection() {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleSimulateDownload = () => {
    if (downloadProgress !== null) return;
    setDownloadProgress(0);
    setDownloadSuccess(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      if (current >= 100) {
        clearInterval(interval);
        setDownloadProgress(100);
        setDownloadSuccess(true);
        setTimeout(() => {
          setDownloadProgress(null);
        }, 3500);
      } else {
        setDownloadProgress(current);
      }
    }, 150);
  };

  return (
    <section id="unduh" className="py-24 border-t border-border bg-surface/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="primary" size="md">
            Pusat Pengunduhan
          </Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl font-display select-none py-1">
            <span className="inline-block text-3d-bubble-main">Unduh Aplikasi</span>{" "}
            <span className="inline-block text-3d-bubble-blue">Hari Ini</span>
          </h2>
          <p className="mt-3 text-base text-foreground-muted">
            Tersedia paket instalasi mandiri (APK) langsung bebas perantara serta tautan ke saluran resmi.
          </p>
        </div>

        {/* Main Download Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Main Download Card */}
          <div className="lg:col-span-7">
            <Card className="border-primary/40 bg-surface/90 shadow-xl shadow-primary/5 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      AeroSync {APP_CONFIG.currentVersion}
                    </h3>
                    <p className="text-xs text-foreground-muted">
                      Rilis Resmi • Arsitektur Universal • {APP_CONFIG.fileSize}
                    </p>
                  </div>
                </div>
                <Badge variant="success" size="md">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Stabil & Terverifikasi</span>
                </Badge>
              </div>

              {/* Download Action Box */}
              <div className="mt-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={APP_CONFIG.downloadApkUrl}
                    download={APP_CONFIG.apkFileName || `aerosync-${APP_CONFIG.currentVersion}.apk`}
                    onClick={handleSimulateDownload}
                    className="flex-1 inline-flex items-center justify-center font-bold transition-all duration-150 rounded-2xl h-14 px-7 text-base gap-2.5 bg-gradient-to-b from-blue-500 via-primary to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_3px_0_#1d4ed8,0_4px_8px_rgba(37,99,235,0.25)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_0_#1d4ed8,0_6px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent select-none"
                  >
                    <Download className="h-5 w-5" />
                    <span>Unduh APK Resmi ({APP_CONFIG.fileSize})</span>
                  </a>

                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => setIsQrModalOpen(true)}
                    className="h-14 px-5"
                    aria-label="Pindai QR Code untuk unduh di ponsel"
                  >
                    <QrCode className="h-5 w-5 text-accent" />
                    <span className="hidden sm:inline">Pindai QR</span>
                  </Button>
                </div>

                {/* Progress bar simulation indicator */}
                {downloadProgress !== null && (
                  <div className="rounded-lg border border-border bg-background p-3 animate-in fade-in">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-foreground-muted">Mengunduh paket instalasi...</span>
                      <span className="font-mono text-accent">{downloadProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-card overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-150"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {downloadSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-success-subtle border border-success/30 p-3 text-xs text-success animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Pengunduhan dimulai. Periksa manajer unduhan peramban Anda.</span>
                  </div>
                )}
              </div>

              {/* Alternative Stores */}
              <div className="mt-8 pt-6 border-t border-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle block mb-3">
                  Saluran Distribusi Lainnya:
                </span>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={APP_CONFIG.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-medium text-foreground hover:bg-surface-hover hover:border-border-subtle transition-all"
                  >
                    <Smartphone className="h-4 w-4 text-accent" />
                    <span>Google Play Store</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>

                  <a
                    href={APP_CONFIG.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-medium text-foreground hover:bg-surface-hover hover:border-border-subtle transition-all"
                  >
                    <FileCheck className="h-4 w-4 text-accent" />
                    <span>GitHub Releases</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Step-by-Step Installation Guide */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Panduan Pemasangan APK Cepat
            </h3>

            {INSTALLATION_STEPS.map((item: { step: string; title: string; description: string }) => (
              <Card key={item.step} className="p-4 sm:p-5 flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-accent font-bold font-display text-sm border border-primary/20">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                    {item.description}
                  </p>
                </div>
              </Card>
            ))}

            <div className="rounded-xl border border-border/80 bg-surface/50 p-4 text-xs text-foreground-subtle flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <span>
                Catatan: Peringatan sumber tidak dikenal adalah mekanisme keamanan standar Android untuk berkas yang diunduh di luar Google Play.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </section>
  );
}
