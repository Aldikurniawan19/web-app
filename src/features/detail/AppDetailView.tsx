"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  HardDrive,
  Download,
  Check,
  Clock,
  Home,
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/Breadcrumb";
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
  breadcrumbs?: BreadcrumbItem[];
}

export function AppDetailView({
  app,
  onBack,
  onDownload,
  breadcrumbs,
}: AppDetailViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<
    "versi" | "informasi" | "changelog"
  >("versi");

  // Reset tab aktif ke "versi" setiap kali aplikasi dibuka
  useEffect(() => {
    setActiveTab("versi");
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
    { id: "versi", label: "Riwayat Versi" },
    { id: "informasi", label: "Informasi" },
    { id: "changelog", label: "Changelog" },
  ] as const;

  const handleBackWithAnimation = (action?: () => void) => {
    const animEls = containerRef.current?.querySelectorAll(".detail-anim");
    if (animEls && animEls.length > 0) {
      gsap.to(animEls, {
        opacity: 0,
        y: 15,
        duration: 0.22,
        stagger: 0.02,
        ease: "power2.in",
        onComplete: action || onBack,
      });
    } else {
      if (action) {
        action();
      } else {
        onBack();
      }
    }
  };

  const defaultBreadcrumbs: BreadcrumbItem[] = [
    {
      label: "Beranda",
      icon: Home,
      onClick: () => handleBackWithAnimation(),
    },
    {
      label: `Detail ${app.name}`,
      isCurrent: true,
    },
  ];

  const resolvedBreadcrumbs: BreadcrumbItem[] =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs.map((bc) => ({
          ...bc,
          onClick: bc.onClick ? () => handleBackWithAnimation(bc.onClick) : undefined,
        }))
      : defaultBreadcrumbs;

  return (
    <div ref={containerRef} className="py-8 sm:py-12 bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Dynamic Breadcrumb Navigation Bar (Home > [Katalog] > Detail) */}
        <div className="detail-anim">
          <Breadcrumb items={resolvedBreadcrumbs} />
        </div>

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

                {/* Size & Version */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{app.fileSize}</span>
                  </div>
                  <span>•</span>
                  <span>Versi {app.version}</span>
                  <span>•</span>
                  <span>{app.downloadsCount} Unduhan</span>
                </div>
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


        </div>
      </div>
    </div>
  );
}
