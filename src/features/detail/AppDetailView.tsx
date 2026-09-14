"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  Star,
  HardDrive,
  Download,
  CheckCircle2,
  Share2,
  Calendar,
  Layers,
  ShieldCheck,
  Check,
} from "lucide-react";
import { AppItem } from "@/types/store";
import { AppIcon } from "@/components/ui/AppIcon";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { Button } from "@/components/ui/Button";
import { ScreenshotSlider } from "@/features/detail/ScreenshotSlider";
import { cn } from "@/lib/utils";
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
    "tentang" | "fitur" | "screenshot" | "informasi" | "changelog" | "system"
  >("tentang");

  useGSAP(
    () => {
      gsap.from(".detail-anim", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });
    },
    { dependencies: [app], scope: containerRef }
  );

  const tabs = [
    { id: "tentang", label: "Tentang" },
    { id: "fitur", label: "Fitur" },
    { id: "screenshot", label: "Screenshot" },
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
                colorClass={app.iconColor}
                size="xl"
                className="shadow-lg shadow-blue-500/10"
              />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground font-display select-none py-0.5">
                    <span className="inline-block text-3d-bubble-main">{app.name}</span>
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

        {/* Screenshot Slider Gallery */}
        <div className="detail-anim">
          <ScreenshotSlider
            appName={app.name}
            screenshots={app.screenshots}
          />
        </div>

        {/* Detail Tabs Bar */}
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

        {/* Tab Body Content Grid (Two Column Layout matching mockup) */}
        <div className="detail-anim grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: About & App Info Table */}
          <div className="lg:col-span-7 space-y-8">
            {/* Section: Tentang Aplikasi */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
              <h2 className="text-lg font-black font-display select-none py-0.5">
                <span className="inline-block text-3d-bubble-main">Tentang</span>{" "}
                <span className="inline-block text-3d-bubble-blue">Aplikasi</span>
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {app.longDescription}
              </p>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Dengan antarmuka yang sederhana dan intuitif, {app.name} sangat cocok digunakan untuk pelajar, mahasiswa, pekerja, maupun siapa saja yang ingin lebih produktif dalam mengelola aktivitas digital harian.
              </p>
            </div>

            {/* Section: Informasi Aplikasi Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-base font-black font-display select-none py-0.5 mb-4">
                <span className="inline-block text-3d-bubble-main">Informasi</span>{" "}
                <span className="inline-block text-3d-bubble-blue">Aplikasi</span>
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Developer</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{app.developer}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Versi</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{app.version}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Ukuran</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{app.fileSize}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Update Terakhir</span>
                  <span className="text-slate-800 dark:text-slate-200">{app.lastUpdated}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Platform</span>
                  <span className="capitalize text-slate-800 dark:text-slate-200">
                    {app.platforms.join(", ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Fitur Utama */}
          <div className="lg:col-span-5 space-y-6">
            {/* Section: Fitur Utama */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black font-display select-none py-0.5">
                <span className="inline-block text-3d-bubble-main">Fitur</span>{" "}
                <span className="inline-block text-3d-bubble-blue">Utama</span>
              </h3>
              <ul className="space-y-3">
                {app.features.map((feature, idx) => (
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
    </div>
  );
}
