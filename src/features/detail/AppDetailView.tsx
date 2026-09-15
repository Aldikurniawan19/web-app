"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  HardDrive,
  Download,
  ShieldCheck,
  Check,
  Smartphone,
  Lock,
  Clock,
  ArrowRight,
  Zap,
  Sliders,
  RefreshCw,
} from "lucide-react";
import { AppItem } from "@/types/store";
import { AppIcon } from "@/components/ui/AppIcon";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { Button } from "@/components/ui/Button";
import { ScreenshotSlider } from "@/features/detail/ScreenshotSlider";
import { cn } from "@/lib/utils";
import { VersionHistoryTab } from "@/features/detail/VersionHistoryTab";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface AppDetailViewProps {
  app: AppItem;
  onBack: () => void;
  onDownload: (app: AppItem) => void;
}

export function AppDetailView({ app, onBack, onDownload }: AppDetailViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<
    "tentang" | "fitur" | "versi" | "informasi" | "changelog" | "system"
  >("tentang");

  // Reset tab aktif ke "tentang" setiap kali aplikasi dibuka
  useEffect(() => {
    setActiveTab("tentang");
  }, [app.id]);

  useGSAP(
    () => {
      gsap.fromTo(
        ".detail-anim",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    },
    { dependencies: [app.id], scope: containerRef }
  );

  const tabs = [
    { id: "tentang", label: "Tentang" },
    { id: "fitur", label: "Fitur" },
    { id: "versi", label: "Riwayat Versi" },
    { id: "informasi", label: "Informasi" },
    { id: "changelog", label: "Changelog" },
    { id: "system", label: "System Requirements" },
  ] as const;

  const handleBackWithAnimation = () => {
    const animEls = containerRef.current?.querySelectorAll(".detail-anim");
    if (animEls && animEls.length > 0) {
      gsap.to(animEls, {
        opacity: 0,
        y: 15,
        duration: 0.22,
        stagger: 0.02,
        ease: "power2.in",
        onComplete: onBack,
      });
    } else {
      onBack();
    }
  };

  return (
    <div ref={containerRef} className="py-8 sm:py-12 bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back navigation link */}
        <button
          type="button"
          onClick={handleBackWithAnimation}
          className="detail-anim group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hover active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Semua Aplikasi</span>
        </button>

        {/* Main App Hero Header Card */}
        <div className="detail-anim rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm transition-colors duration-200">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Left Col: Big Icon & Description */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row gap-5 items-start">
              <AppIcon
                type={app.iconType}
                iconUrl={app.iconUrl}
                colorClass={app.iconColor}
                size="xl"
                className="shadow-lg shadow-blue-500/10"
              />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display select-none py-0.5">
                    {app.name}
                  </h1>
                  <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-semibold text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                    {app.category}
                  </span>
                </div>

                {/* Rating & Size & Version */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{app.rating.toFixed(1)}</span>
                    <span className="font-normal text-slate-500 dark:text-slate-400">({app.reviewsCount})</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{app.fileSize}</span>
                  </div>
                  <span>•</span>
                  <span>Versi {app.version}</span>
                  <span>•</span>
                  <span>{app.downloadsCount} Unduhan</span>
                </div>

                {/* Long Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                  {app.longDescription}
                </p>
              </div>
            </div>

            {/* Right Col: Download CTA & Platform Icons */}
            <div className="lg:col-span-4 flex flex-col sm:items-end gap-4 lg:pl-6 lg:border-l border-slate-100 dark:border-slate-800">
              <Button
                size="lg"
                variant="primary"
                onClick={() => onDownload(app)}
                className="w-full sm:w-auto h-12 px-8 font-semibold shadow-md shadow-primary/25 rounded-xl text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <PlatformBadge platforms={app.platforms} />
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot Slider Gallery Directly Below Download Card */}
        <div className="detail-anim">
          <ScreenshotSlider
            appName={app.name}
            screenshots={app.screenshots}
          />
        </div>

        {/* Detail Tabs Bar (Text only) */}
        <div className="detail-anim flex items-center gap-2.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pt-2 pb-3.5 px-1.5 -mx-1.5 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 select-none",
                  isActive
                    ? "bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] -translate-y-0.5"
                    : "border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_0_#cbd5e1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0.5"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Body Content */}
        <div key={activeTab} className="transition-opacity duration-200">
          {/* 1. TAB: TENTANG */}
          {activeTab === "tentang" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
                {/* Left Column: Deskripsi & Informasi Cepat */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Card: Tentang Aplikasi */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white font-display select-none py-0.5">
                      Tentang Aplikasi
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {app.longDescription}
                    </p>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      Dengan antarmuka yang bersih dan performa ringan, {app.name} dirancang untuk memberikan kemudahan bagi pengguna harian tanpa membebani memori dan baterai perangkat.
                    </p>

                    {/* Highlight Point Boxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                          <Zap className="h-4 w-4 text-primary" />
                          <span>Performa Responsif</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Waktu buka instan dan transisi antarmuka mulus 60 FPS.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          <span>Privasi Terlindungi</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Penyimpanan terenkripsi dan bebas pelacakan pihak ketiga.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card: Spesifikasi Singkat */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <h3 className="text-base font-black text-slate-900 dark:text-white font-display select-none py-0.5 mb-4">
                      Spesifikasi Singkat
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400">Developer</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{app.developer}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400">Versi</span>
                        <p className="font-semibold font-mono text-slate-800 dark:text-slate-200">{app.version}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400">Ukuran Berkas</span>
                        <p className="font-semibold font-mono text-slate-800 dark:text-slate-200">{app.fileSize}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400">Pembaruan</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{app.lastUpdated}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400">Platform</span>
                        <p className="font-semibold capitalize text-slate-800 dark:text-slate-200">{app.platforms.join(", ")}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400">Total Unduhan</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{app.downloadsCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Cuplikan Fitur */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Card: Cuplikan Fitur Utama */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900 dark:text-white font-display select-none py-0.5">
                        Fitur Utama
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab("fitur")}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
                      >
                        <span>Lihat Semua</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <ul className="space-y-3">
                      {app.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                          <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. TAB: FITUR */}
          {activeTab === "fitur" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white font-display select-none py-0.5">
                      Fitur Unggulan & Kemampuan
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Seluruh fitur bawaan yang tersedia secara gratis di versi {app.version}.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 px-3.5 py-1 text-xs font-bold text-primary dark:text-blue-400">
                    {app.features.length} Fitur Tersemat
                  </span>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {app.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 transition-all hover:border-blue-200 dark:hover:border-blue-800/60 hover:bg-blue-50/20 dark:hover:bg-blue-950/20"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          {feature}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Dioptimalkan untuk respon cepat, penggunaan memori hemat, dan kompatibilitas sistem terjamin.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extra Value Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="rounded-xl p-4 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span>Optimasi Memori</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Konsumsi RAM rendah sehingga ponsel tetap dingin dan baterai hemat.
                    </p>
                  </div>

                  <div className="rounded-xl p-4 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Sliders className="h-4 w-4 text-primary" />
                      <span>Dukungan Tema Adaptif</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Menyesuaikan mode gelap dan terang secara otomatis mengikuti sistem OS.
                    </p>
                  </div>

                  <div className="rounded-xl p-4 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <RefreshCw className="h-4 w-4 text-emerald-500" />
                      <span>Pembaruan Rutin</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Menerima pembaruan keamanan dan stabilitas secara berkala.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RIWAYAT VERSI */}
          {activeTab === "versi" && (
            <VersionHistoryTab app={app} onDownload={onDownload} />
          )}

          {/* 3. TAB: INFORMASI */}
          {activeTab === "informasi" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Card 1: Data Rilis & Paket */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-display select-none py-0.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                    Informasi Rilis & Berkas
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500 dark:text-slate-400">Nama Aplikasi</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{app.name}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500 dark:text-slate-400">Pengembang</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{app.developer}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500 dark:text-slate-400">Versi Terkini</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{app.version}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500 dark:text-slate-400">Ukuran Berkas</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{app.fileSize}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500 dark:text-slate-400">Kategori</span>
                      <span className="font-semibold text-primary">{app.category}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500 dark:text-slate-400">Pembaruan Terakhir</span>
                      <span className="text-slate-800 dark:text-slate-200">{app.lastUpdated}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500 dark:text-slate-400">Jumlah Unduhan</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{app.downloadsCount}</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Keamanan, Distribusi & Lisensi */}
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-black text-slate-900 dark:text-white font-display select-none py-0.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                      Distribusi & Lisensi
                    </h3>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                      <div className="flex justify-between py-3">
                        <span className="text-slate-500 dark:text-slate-400">Tipe Lisensi</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Gratis (Freeware)</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-slate-500 dark:text-slate-400">Platform</span>
                        <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">
                          {app.platforms.join(", ")}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-slate-500 dark:text-slate-400">Format Distribusi</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">Android Package (.apk)</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-slate-500 dark:text-slate-400">Dukungan Bahasa</span>
                        <span className="text-slate-800 dark:text-slate-200">Bahasa Indonesia, English</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. TAB: CHANGELOG */}
          {activeTab === "changelog" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white font-display select-none py-0.5">
                    Catatan Pembaruan & Changelog
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Riwayat pembaruan fitur, peningkatan performa, dan perbaikan bug pada {app.name}.
                  </p>
                </div>

                {/* Changelog Timeline */}
                <div className="relative pl-6 sm:pl-8 border-l-2 border-primary/25 dark:border-primary/40 space-y-8 my-4 ml-2 sm:ml-4">
                  {/* Current Version */}
                  <div className="relative space-y-3">
                    {/* Timeline Node */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ring-4 ring-white dark:ring-slate-900 shadow-sm">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                        v{app.version}
                      </span>
                      <span className="rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 px-2.5 py-0.5 text-[11px] font-bold text-primary dark:text-blue-400">
                        Versi Terbaru
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Dirilis pada {app.lastUpdated}
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>Peningkatan kecepatan pemuatan antarmuka dan respon navigasi.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>Optimalisasi konsumsi memori RAM dan daya baterai pada perangkat spesifikasi menengah.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>Perbaikan bug minor pada penyimpanan berkas lokal dan kestabilan aplikasi.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>Peningkatan kompatibilitas untuk versi sistem operasi Android terbaru.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Previous Version */}
                  <div className="relative space-y-3 opacity-80">
                    {/* Timeline Node */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ring-4 ring-white dark:ring-slate-900">
                      <Clock className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-bold text-slate-700 dark:text-slate-300 font-mono">
                        v1.9.0
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Pembaruan Stabilitas
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span>Integrasi dukungan tema gelap otomatis berdasarkan pengaturan sistem ponsel.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span>Penyempurnaan tata letak antarmuka agar responsif di layar rasio modern.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. TAB: SYSTEM REQUIREMENTS */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white font-display select-none py-0.5">
                    Kebutuhan Sistem Perangkat
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Pastikan ponsel Anda memenuhi spesifikasi di bawah ini untuk performa terbaik.
                  </p>
                </div>

                {/* Specs Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Minimum Specs */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-5 space-y-4">
                    <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-200/70 dark:border-slate-700/60 pb-3">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <span>Spesifikasi Minimum</span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 dark:text-slate-400">Sistem Operasi</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{app.systemRequirements.os}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 dark:text-slate-400">Memori RAM</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{app.systemRequirements.ram}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 dark:text-slate-400">Ruang Bebas</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{app.systemRequirements.storage}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Specs */}
                  <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 p-5 space-y-4">
                    <div className="flex items-center gap-2.5 text-blue-950 dark:text-blue-300 font-bold text-sm border-b border-blue-100 dark:border-blue-900/60 pb-3">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>Spesifikasi Direkomendasikan</span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 dark:text-slate-400">Sistem Operasi</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Android 10.0 atau lebih baru</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 dark:text-slate-400">Memori RAM</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">4 GB RAM atau lebih</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 dark:text-slate-400">Ruang Bebas</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">100 MB ruang penyimpanan</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions Breakdown */}
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span>Izin Akses Aplikasi (Permissions)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Penyimpanan</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Membaca dan menyimpan data berkas.</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Akses Jaringan</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pemeriksaan pembaruan dan sinkronisasi.</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Notifikasi</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pengingat jadwal dan pemberitahuan.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
