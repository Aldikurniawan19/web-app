"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Gamepad2,
  HardDrive,
  Image as ImageIcon,
  Play,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { AppItem, AppScreenshot } from "@/types/store";
import { AppIcon } from "@/components/ui/AppIcon";
import { IPhoneMockup } from "@/components/ui/IPhoneMockup";
import { cn } from "@/lib/utils";
import { isLocalOptimizedMediaUrl } from "@/lib/media-url";

const DEFAULT_SCREENSHOT_DELAY_MS = 2800;
const SLIDE_TRANSITION_MS = 520;

interface PhoneMockupPreviewProps {
  app: AppItem;
  isActive?: boolean;
  isPriority?: boolean;
  autoplayDelay?: number;
  onSelectApp?: (app: AppItem) => void;
  onDownloadApp?: (app: AppItem) => void;
  className?: string;
}

/**
 * Mengambil daftar tangkapan layar yang memiliki URL gambar valid (hasil unggahan).
 */
function getUploadedScreenshots(app: AppItem): AppScreenshot[] {
  if (!Array.isArray(app.screenshots)) return [];
  return app.screenshots.filter(
    (sc) =>
      Boolean(sc) &&
      typeof sc.imageUrl === "string" &&
      sc.imageUrl.trim().length > 0
  );
}

/**
 * Daftar fitur ringkas yang ditampilkan ketika aplikasi belum memiliki gambar tangkapan layar.
 */
function MobileFeatureHighlights({ app }: { app: AppItem }) {
  const highlights =
    app.features && app.features.length > 0
      ? app.features.slice(0, 3)
      : [
          app.tagline || app.description,
          `Kompatibel dengan ${app.systemRequirements?.os || "Android 8.0+"}`,
          "Paket APK resmi bebas iklan & pelacak",
        ];

  return (
    <div className="mt-auto rounded-2xl border border-border bg-background p-3.5 space-y-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
        <span>Fitur Utama</span>
        <span className="font-mono text-primary">Terverifikasi</span>
      </div>
      <div className="space-y-1.5">
        {highlights.map((feat, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-foreground">
            <CheckCircle2
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success"
              aria-hidden="true"
            />
            <span className="line-clamp-1 leading-snug">{feat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Tampilan fallback layar aplikasi (resolusi logis 393px) jika belum ada
 * gambar tangkapan layar yang diunggah untuk aplikasi terkait.
 */
function FallbackMobileScreenBody({ app }: { app: AppItem }) {
  const featureA = app.features?.[0] || app.tagline || app.description;
  const featureB = app.features?.[1] || `Versi ${app.version} siap dipasang`;

  const metaStatsRow = (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-xl border border-border bg-background p-2.5 text-center">
        <p className="font-mono text-xs font-bold text-foreground">
          {app.downloadsCount}
        </p>
        <p className="mt-0.5 text-[10px] text-foreground-muted">Unduhan</p>
      </div>
      <div className="rounded-xl border border-border bg-background p-2.5 text-center">
        <p className="font-mono text-xs font-bold text-foreground">
          {app.fileSize}
        </p>
        <p className="mt-0.5 text-[10px] text-foreground-muted">Ukuran</p>
      </div>
      <div className="rounded-xl border border-border bg-background p-2.5 text-center">
        <p className="font-mono text-xs font-bold text-primary">Gratis</p>
        <p className="mt-0.5 text-[10px] text-foreground-muted">Lisensi</p>
      </div>
    </div>
  );

  switch (app.iconType) {
    case "education":
      return (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {metaStatsRow}
          <div className="rounded-2xl border border-border bg-primary-subtle p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-primary">
              <span>Progres Belajar</span>
              <span className="font-mono">78%</span>
            </div>
            <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-background">
              <div className="h-full w-[78%] rounded-full bg-primary" />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {featureA}
              </p>
              <p className="mt-0.5 text-xs text-foreground-muted">
                12 Modul · Video HD
              </p>
            </div>
          </div>
          <MobileFeatureHighlights app={app} />
        </div>
      );

    case "business":
      return (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {metaStatsRow}
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground-muted">
                Ringkasan Harian
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-success-subtle px-2 py-0.5 font-mono text-xs font-semibold text-success">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                +14%
              </span>
            </div>
            <p className="mt-1.5 font-display text-2xl font-bold text-foreground">
              48 Transaksi
            </p>
            <div className="mt-3 flex h-20 items-end gap-2">
              {[42, 65, 54, 80, 68, 95].map((heightPct, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex-1 rounded-t-md",
                    idx === 5 ? "bg-primary" : "bg-accent-subtle"
                  )}
                  style={{ height: `${heightPct}%` }}
                />
              ))}
            </div>
          </div>
          <MobileFeatureHighlights app={app} />
        </div>
      );

    case "photo":
      return (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {metaStatsRow}
          <div className="flex h-36 items-center justify-center rounded-2xl border border-border bg-background-soft">
            <div className="flex flex-col items-center gap-2 text-primary">
              <ImageIcon className="h-9 w-9" aria-hidden="true" />
              <span className="font-mono text-xs font-medium text-foreground-muted">
                RAW · 4096 × 3072
              </span>
            </div>
          </div>
          <div className="space-y-2.5 rounded-2xl border border-border bg-background p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <SlidersHorizontal
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              <span>Penyesuaian Tone</span>
            </div>
            {[
              { label: "Eksposur", width: "w-3/4", value: "+18" },
              { label: "Kontras", width: "w-2/3", value: "+12" },
            ].map((slider) => (
              <div key={slider.label} className="space-y-1">
                <div className="flex justify-between text-xs text-foreground-muted">
                  <span>{slider.label}</span>
                  <span className="font-mono">{slider.value}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-background-soft">
                  <div
                    className={cn("h-full rounded-full bg-primary", slider.width)}
                  />
                </div>
              </div>
            ))}
          </div>
          <MobileFeatureHighlights app={app} />
        </div>
      );

    case "vpn":
      return (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {metaStatsRow}
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-border bg-background p-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle text-success ring-8 ring-success-subtle">
              <ShieldCheck className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="mt-3 font-display text-base font-bold text-foreground">
              Koneksi Terlindungi
            </p>
            <p className="mt-1 font-mono text-xs text-foreground-muted">
              WireGuard · 18 ms · No-Log
            </p>
          </div>
          <MobileFeatureHighlights app={app} />
        </div>
      );

    case "game":
      return (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {metaStatsRow}
          <div className="flex h-36 flex-col items-center justify-center rounded-2xl border border-border bg-primary-subtle p-4 text-center">
            <Gamepad2 className="h-9 w-9 text-primary" aria-hidden="true" />
            <p className="mt-2 font-display text-base font-bold text-foreground">
              Mode Arcade 60fps
            </p>
            <span className="mt-1 rounded-full bg-surface px-3 py-0.5 font-mono text-xs text-primary">
              Offline Ready
            </span>
          </div>
          <MobileFeatureHighlights app={app} />
        </div>
      );

    case "cloud":
      return (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {metaStatsRow}
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">Ruang Awan</span>
              <span className="font-mono text-primary">32 / 50 GB</span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-background-soft">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3.5">
            <FileText
              className="h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="truncate text-sm text-foreground">{featureA}</span>
          </div>
          <MobileFeatureHighlights app={app} />
        </div>
      );

    case "media":
      return (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {metaStatsRow}
          <div className="relative flex h-36 flex-col items-center justify-center rounded-2xl bg-slate-900 p-4 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg">
              <Play className="h-5 w-5 fill-current ml-0.5" aria-hidden="true" />
            </div>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-1/2 rounded-full bg-primary" />
            </div>
          </div>
          <MobileFeatureHighlights app={app} />
        </div>
      );

    case "document":
    default:
      return (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {metaStatsRow}
          <div className="rounded-2xl border border-accent-subtle bg-primary-subtle p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">
                Ringkasan Aplikasi
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Siap Pakai
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-foreground line-clamp-2">
              {app.description || featureA}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-border bg-background p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground-muted">
                <HardDrive className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Sistem</span>
              </div>
              <p className="truncate text-xs font-semibold text-foreground">
                {app.systemRequirements?.os || "Android 8.0+"}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground-muted">
                <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Pembaruan</span>
              </div>
              <p className="truncate text-xs font-semibold text-foreground">
                {app.lastUpdated || "Rilis Terbaru"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="truncate text-xs font-medium text-foreground-muted">
              Pengembang: <span className="font-semibold text-foreground">{app.developer}</span>
            </p>
            <p className="mt-1 truncate text-xs text-foreground-muted">
              {featureB}
            </p>
          </div>

          <MobileFeatureHighlights app={app} />
        </div>
      );
  }
}

/**
 * Skeleton loading untuk pratinjau layar handphone sebelum data aplikasi dari server tiba.
 */
export function PhoneMockupSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative mx-auto select-none", className)}
    >
      <IPhoneMockup
        model="15-pro"
        color="black"
        scale={0.62}
        screenBg="var(--color-surface)"
        safeArea={false}
        showHomeIndicator={false}
      >
        <div className="flex flex-1 flex-col justify-between p-4 pt-9 animate-pulse">
          {/* Header Aplikasi Skeleton */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-background-soft shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 rounded bg-background-soft" />
                <div className="h-2.5 w-16 rounded bg-background-soft" />
              </div>
            </div>

            {/* Area Konten Utama / Screenshot Skeleton */}
            <div className="h-64 w-full rounded-2xl bg-background-soft" />

            <div className="space-y-1.5 pt-1">
              <div className="h-2.5 w-full rounded bg-background-soft" />
              <div className="h-2.5 w-4/5 rounded bg-background-soft" />
            </div>
          </div>

          {/* Footer Tombol Skeleton */}
          <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
            <div className="space-y-1">
              <div className="h-2.5 w-16 rounded bg-background-soft" />
              <div className="h-2 w-12 rounded bg-background-soft" />
            </div>
            <div className="h-7 w-16 rounded-full bg-background-soft" />
          </div>
        </div>
      </IPhoneMockup>
    </div>
  );
}

/**
 * Komponen pratinjau layar handphone iPhone 15 Pro untuk carousel utama Hero Section.
 * Memprioritaskan gambar tangkapan layar asli yang sudah diunggah dan menggeser
 * tangkapan layar di dalam layar ponsel secara otomatis tanpa kontrol overlay.
 */
export function PhoneMockupPreview({
  app,
  isActive = true,
  isPriority = false,
  autoplayDelay = DEFAULT_SCREENSHOT_DELAY_MS,
  onSelectApp,
  onDownloadApp,
  className,
}: PhoneMockupPreviewProps) {
  const uploadedScreenshots = useMemo(() => getUploadedScreenshots(app), [app]);
  const hasMultipleShots = uploadedScreenshots.length > 1;
  const slidesToRender = useMemo(
    () =>
      hasMultipleShots
        ? [...uploadedScreenshots, uploadedScreenshots[0]]
        : uploadedScreenshots,
    [hasMultipleShots, uploadedScreenshots]
  );

  const [slideIndex, setSlideIndex] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [mountExtraSlides, setMountExtraSlides] = useState(false);

  const renderedSlides =
    mountExtraSlides || slideIndex > 0 ? slidesToRender : slidesToRender.slice(0, 1);

  // Reset posisi slide ke awal saat aplikasi berganti atau menjadi aktif kembali
  useEffect(() => {
    setIsTransitionEnabled(false);
    setSlideIndex(0);
    setImgError(false);
    setMountExtraSlides(false);
    const rafId = requestAnimationFrame(() => setIsTransitionEnabled(true));
    return () => cancelAnimationFrame(rafId);
  }, [app.id, isActive]);

  // Tunda pemasangan slide ke-2 dst agar LCP tangkapan layar utama tidak terhambat saat muat awal
  useEffect(() => {
    if (!isActive || !hasMultipleShots) return;
    const timer = setTimeout(() => {
      setMountExtraSlides(true);
    }, 700);
    return () => clearTimeout(timer);
  }, [app.id, isActive, hasMultipleShots]);

  // Geser otomatis tangkapan layar di dalam layar HP ketika slide HP ini sedang aktif
  useEffect(() => {
    if (!isActive || !hasMultipleShots || isHovered || imgError) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const interval = setInterval(() => {
      setIsTransitionEnabled(true);
      setSlideIndex((prev) =>
        prev >= uploadedScreenshots.length ? prev : prev + 1
      );
    }, autoplayDelay);

    return () => clearInterval(interval);
  }, [
    isActive,
    hasMultipleShots,
    isHovered,
    imgError,
    uploadedScreenshots.length,
    autoplayDelay,
  ]);

  // Reset mulus ke slide pertama setelah mencapai klon slide terakhir
  useEffect(() => {
    if (!hasMultipleShots || slideIndex !== uploadedScreenshots.length) return;

    const timer = setTimeout(() => {
      setIsTransitionEnabled(false);
      setSlideIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitionEnabled(true);
        });
      });
    }, SLIDE_TRANSITION_MS);

    return () => clearTimeout(timer);
  }, [slideIndex, hasMultipleShots, uploadedScreenshots.length]);

  const hasValidScreenshot = uploadedScreenshots.length > 0 && !imgError;

  return (
    <div
      className={cn("relative mx-auto select-none", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <IPhoneMockup
        model="15-pro"
        color="black"
        scale={0.62}
        screenBg="var(--color-surface)"
        safeArea={!hasValidScreenshot}
        safeAreaOverrides={{ top: 14, bottom: 10 }}
        showHomeIndicator={false}
      >
        {hasValidScreenshot ? (
          <div className="relative flex-1 min-h-0 overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => onSelectApp?.(app)}
              aria-label={`Lihat detail aplikasi ${app.name}`}
              className="absolute inset-0 block overflow-hidden p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div
                className="flex h-full w-full"
                style={{
                  transform: hasMultipleShots
                    ? `translateX(-${slideIndex * 100}%)`
                    : undefined,
                  transition:
                    hasMultipleShots && isTransitionEnabled
                      ? `transform ${SLIDE_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
                      : "none",
                }}
              >
                {renderedSlides.map((sc, idx) => (
                  <div
                    key={`${app.id}-shot-${sc.id || idx}-${idx}`}
                    className="relative flex h-full w-full shrink-0 items-center justify-center"
                  >
                    {isLocalOptimizedMediaUrl(sc.imageUrl) ? (
                      <Image
                        src={sc.imageUrl}
                        alt={sc.title || `Tangkapan layar ${app.name}`}
                        fill
                        sizes="244px"
                        quality={80}
                        priority={Boolean(isPriority && idx === 0)}
                        loading={isPriority && idx === 0 ? undefined : "lazy"}
                        onError={() => setImgError(true)}
                        className="object-contain"
                      />
                    ) : (
                      <img
                        src={sc.imageUrl}
                        alt={sc.title || `Tangkapan layar ${app.name}`}
                        onError={() => setImgError(true)}
                        loading={isPriority && idx === 0 ? "eager" : "lazy"}
                        decoding="async"
                        className="block h-full w-full object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>
            </button>
          </div>
        ) : (
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <div
              className="flex flex-col"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "161.2903%",
                height: "161.2903%",
                transform: "scale(0.62)",
                transformOrigin: "top left",
              }}
            >
              {/* Status Bar sejajar dengan Dynamic Island */}
              <div className="flex h-[36px] shrink-0 items-center justify-between px-7">
                <span className="font-mono text-[15px] font-semibold tracking-tight text-foreground">
                  09:41
                </span>

                {/* Ruang kosong tengah sejajar Dynamic Island */}
                <span aria-hidden="true" className="w-[130px]" />

                <div className="flex items-center gap-2 text-foreground">
                  <div className="flex items-end gap-[2px]" aria-hidden="true">
                    <span className="h-1.5 w-[3px] rounded-full bg-foreground" />
                    <span className="h-2.5 w-[3px] rounded-full bg-foreground" />
                    <span className="h-3.5 w-[3px] rounded-full bg-foreground" />
                    <span className="h-4 w-[3px] rounded-full bg-foreground opacity-35" />
                  </div>
                  <Wifi className="h-4 w-4" aria-hidden="true" />
                  <div aria-hidden="true" className="flex items-center opacity-85">
                    <div className="flex h-[13px] w-[24px] items-center rounded-[4px] border-[1.5px] border-foreground p-[1.5px]">
                      <div className="h-full w-4/5 rounded-[1.5px] bg-foreground" />
                    </div>
                    <div className="h-1.5 w-[2px] rounded-r-sm bg-foreground" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectApp?.(app)}
                className="flex flex-1 flex-col gap-3.5 overflow-hidden px-5 pt-4 pb-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {/* Header Aplikasi di Layar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <AppIcon
                      type={app.iconType}
                      iconUrl={app.iconUrl}
                      colorClass={app.iconColor}
                      size="md"
                      alt={`Ikon ${app.name}`}
                      className={cn(
                        "h-12 w-12 rounded-2xl shrink-0",
                        !app.iconUrl && "p-2.5"
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-bold text-foreground">
                        {app.name}
                      </p>
                      <p className="truncate text-xs text-foreground-muted">
                        {app.category}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-background-soft px-2.5 py-1 font-mono text-xs font-semibold text-foreground">
                    <Star
                      className="h-3.5 w-3.5 fill-current text-warning"
                      aria-hidden="true"
                    />
                    {app.rating}
                  </span>
                </div>

                <FallbackMobileScreenBody app={app} />
              </button>

              {/* Footer Aksi Aplikasi & Unduh APK di Layar Ponsel */}
              <div className="border-t border-border bg-background-soft px-4 py-3">
                <div className="flex items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectApp?.(app)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                  >
                    <AppIcon
                      type={app.iconType}
                      iconUrl={app.iconUrl}
                      colorClass={app.iconColor}
                      size="sm"
                      alt={`Ikon ${app.name}`}
                      className={cn(
                        "h-9 w-9 rounded-xl shrink-0",
                        !app.iconUrl && "p-2"
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-bold text-foreground">
                        {app.name}
                      </p>
                      <p className="font-mono text-[11px] text-foreground-muted truncate">
                        v{app.version} · {app.fileSize}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onDownloadApp ? onDownloadApp(app) : onSelectApp?.(app)
                    }
                    aria-label={`Unduh ${app.name}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Unduh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </IPhoneMockup>
    </div>
  );
}
