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
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="primary"
                fullWidth
                className="shadow-lg shadow-primary/25"
              >
                <Download className="h-5 w-5" />
                <span>Unduh APK ({APP_CONFIG.fileSize})</span>
              </Button>
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
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                fullWidth
                className="w-full sm:w-auto"
              >
                <span>Google Play</span>
                <ExternalLink className="h-4 w-4 opacity-70" />
              </Button>
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
