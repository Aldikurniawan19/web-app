"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  QrCode,
  ShieldCheck,
  Zap,
  Lock,
  ExternalLink,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { APP_CONFIG } from "@/constants/app-data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QrCodeModal } from "@/features/download/QrCodeModal";

export function HeroSection() {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Subtle Background Glow Accent (No generic AI gradient slop, structured micro-radial) */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[420px] w-[800px] max-w-full rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Release Version Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-foreground-muted shadow-sm backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="font-semibold text-foreground">
              AeroSync {APP_CONFIG.currentVersion}
            </span>
            <span className="text-foreground-subtle">|</span>
            <span className="text-foreground-muted">Rilis Stabil {APP_CONFIG.releaseDate}</span>
          </div>

          {/* Primary Main Heading */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-[1.15]">
            Workspace Cerdas & Sinkronisasi{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
              Lokal-Pertama
            </span>{" "}
            untuk Android
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg leading-relaxed text-foreground-muted sm:text-xl max-w-2xl mx-auto">
            {APP_CONFIG.shortDescription}
          </p>

          {/* Primary Call-to-Actions */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4">
            <a
              href="#unduh"
              className="w-full sm:w-auto inline-flex items-center justify-center font-bold transition-all duration-150 rounded-2xl h-13 px-7 text-base gap-2.5 bg-gradient-to-b from-blue-500 via-primary to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_3px_0_#1d4ed8,0_4px_8px_rgba(37,99,235,0.25)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_0_#1d4ed8,0_6px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#1d4ed8] select-none"
            >
              <Download className="h-5 w-5" />
              <span>Unduh APK ({APP_CONFIG.fileSize})</span>
            </a>

            <Button
              size="lg"
              variant="secondary"
              fullWidth
              className="w-full sm:w-auto"
              onClick={() => setIsQrModalOpen(true)}
            >
              <QrCode className="h-5 w-5 text-accent" />
              <span>Pindai Kode QR</span>
            </Button>

            <a
              href={APP_CONFIG.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center font-bold transition-all duration-150 rounded-2xl h-13 px-7 text-base gap-2.5 bg-gradient-to-b from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-slate-300 dark:border-slate-700 text-foreground hover:border-primary hover:text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_0_#cbd5e1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#cbd5e1] select-none"
            >
              <span>Google Play</span>
              <ExternalLink className="h-4 w-4 opacity-70" />
            </a>
          </div>

          {/* Trust Points */}
          <div className="mt-12 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-3">
            <div className="flex items-center justify-center gap-2.5 text-xs text-foreground-muted">
              <ShieldCheck className="h-4 w-4 text-success shrink-0" />
              <span>100% Bebas Iklan & Pelacak</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-xs text-foreground-muted">
              <Lock className="h-4 w-4 text-accent shrink-0" />
              <span>Enkripsi AES-256 On-Device</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-xs text-foreground-muted">
              <Zap className="h-4 w-4 text-accent shrink-0" />
              <span>RAM Rendah & Hemat Daya</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal Trigger */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </section>
  );
}
