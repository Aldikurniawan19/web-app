"use client";

import React from "react";
import {
  Download,
  Settings,
  FolderOpen,
  Smartphone,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ShimmerTitleText } from "@/components/ui/ShimmerTitleText";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

interface ApkGuideSectionProps {
  onOpenGuideModal?: () => void;
}

interface GuideStep {
  step: string;
  title: string;
  description: string;
  tip: string;
  icon: React.ComponentType<{ className?: string }>;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    step: "01",
    title: "Unduh Berkas APK",
    description:
      "Pilih aplikasi yang diinginkan di katalog alllprojects, lalu klik tombol Unduh APK. Berkas installer resmi (.apk) akan langsung tersimpan di folder Download perangkat Anda.",
    tip: "Ukuran berkas & hash SHA-256 tertera jelas di halaman detail.",
    icon: Download,
  },
  {
    step: "02",
    title: "Izinkan Sumber Tidak Dikenal",
    description:
      "Jika muncul peringatan keamanan sistem Android, masuk ke Pengaturan -> Keamanan -> pilih browser atau File Manager Anda dan aktifkan izin 'Instal aplikasi tidak dikenal'.",
    tip: "Izin ini hanya perlu diaktifkan satu kali per aplikasi pengunduh.",
    icon: Settings,
  },
  {
    step: "03",
    title: "Buka & Pasang Berkas",
    description:
      "Tarik bilah notifikasi atau buka aplikasi Pengelola Berkas (File Manager), ketuk file .apk yang baru selesai diunduh, lalu tekan tombol 'Instal' pada dialog pop-up.",
    tip: "Proses pemasangan otomatis selesai dalam hitungan detik.",
    icon: FolderOpen,
  },
  {
    step: "04",
    title: "Selesai & Buka Aplikasi",
    description:
      "Setelah instalasi berhasil, tekan tombol 'Buka' atau temukan ikon aplikasi baru di menu utama ponsel Anda. Aplikasi siap digunakan secara penuh dan lancar.",
    tip: "Aplikasi bebas watermark dan siap pakai tanpa registrasi rumit.",
    icon: Smartphone,
  },
];

export function ApkGuideSection({ onOpenGuideModal }: ApkGuideSectionProps) {
  return (
    <section
      id="panduan-apk"
      className="relative py-14 sm:py-20 bg-slate-50/60 border-t border-slate-200/80 transition-colors duration-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="mx-auto max-w-3xl text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-display select-none py-1">
            <span className="inline-block text-3d-bubble-main">Panduan Mudah</span>{" "}
            <ShimmerTitleText>Pasang APK</ShimmerTitleText>
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Ikuti 4 langkah sederhana berikut untuk memasang aplikasi format APK langsung di smartphone atau tablet Android Anda dengan aman dan cepat.
          </p>

          {onOpenGuideModal && (
            <div className="pt-1 flex justify-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onOpenGuideModal}
                className="text-xs font-bold gap-2 px-4 shadow-sm"
              >
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Buka Modal Panduan Lengkap</span>
              </Button>
            </div>
          )}
        </ScrollReveal>

        {/* 4 Steps Bento / Grid Cards */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {GUIDE_STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollReveal
                key={item.step}
                delayMs={index * 75}
                className={cn(
                  "h-full relative",
                  index === 0 && "z-30",
                  index === 1 && "z-20",
                  index === 2 && "z-10",
                  index === 3 && "z-0"
                )}
              >
                <div className="guide-step-card group relative flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1">
                  <div>
                    {/* Top Row: 3D Icon Badge & Step Number */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] transition-transform duration-200 group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      {/* Step Number di Kanan Atas */}
                      <div className="relative inline-flex items-center select-none py-0.5">
                        <span className="guide-step-number font-display text-2xl sm:text-3xl font-black select-none">
                          {item.step}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="mt-4 text-base font-bold text-foreground tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Micro Tip */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                    <span className="leading-snug">{item.tip}</span>
                  </div>

                  {/* Penghubung Antar Card (Step Connectors) */}
                  {index < GUIDE_STEPS.length - 1 && (
                    <>
                      {/* 1. Desktop Connector (lg:grid-cols-4) */}
                      <div
                        className="guide-connector-desktop hidden lg:flex absolute left-[calc(100%+12px)] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none"
                        aria-hidden="true"
                      >
                        <div className="w-6 h-[2px] bg-slate-200 absolute top-1/2 -translate-y-1/2" />
                        <div className="guide-connector-node relative flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm">
                          <ChevronRight className="guide-connector-icon h-4 w-4 text-slate-400 transition-colors" />
                        </div>
                      </div>

                      {/* 2. Tablet Connector (md:grid-cols-2) */}
                      {(index === 0 || index === 2) && (
                        <div
                          className="guide-connector-tablet hidden md:flex lg:hidden absolute left-[calc(100%+12px)] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none"
                          aria-hidden="true"
                        >
                          <div className="w-6 h-[2px] bg-slate-200 absolute top-1/2 -translate-y-1/2" />
                          <div className="guide-connector-node relative flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm">
                            <ChevronRight className="guide-connector-icon h-4 w-4 text-slate-400 transition-colors" />
                          </div>
                        </div>
                      )}
                      {index === 1 && (
                        <div
                          className="guide-connector-tablet hidden md:flex lg:hidden absolute left-1/2 top-[calc(100%+12px)] -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none"
                          aria-hidden="true"
                        >
                          <div className="h-6 w-[2px] bg-slate-200 absolute left-1/2 -translate-x-1/2" />
                          <div className="guide-connector-node relative flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm">
                            <ChevronDown className="guide-connector-icon h-4 w-4 text-slate-400 transition-colors" />
                          </div>
                        </div>
                      )}

                      {/* 3. Mobile Connector (grid-cols-1) */}
                      <div
                        className="guide-connector-mobile flex md:hidden absolute left-1/2 top-[calc(100%+8px)] sm:top-[calc(100%+12px)] -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none"
                        aria-hidden="true"
                      >
                        <div className="h-4 sm:h-6 w-[2px] bg-slate-200 absolute left-1/2 -translate-x-1/2" />
                        <div className="guide-connector-node relative flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 shadow-xs">
                          <ChevronDown className="guide-connector-icon h-3.5 w-3.5 text-slate-400 transition-colors" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
