"use client";

import React, { useRef } from "react";
import {
  Download,
  Settings,
  FolderOpen,
  Smartphone,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/Button";

interface ApkGuideSectionProps {
  onOpenGuideModal?: () => void;
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
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
      "Pilih aplikasi yang diinginkan di katalog AppHub, lalu klik tombol Unduh APK. Berkas installer resmi (.apk) akan langsung tersimpan di folder Download perangkat Anda.",
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
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Animasi judul header section (semua ukuran layar): animasi muncul dan animasi keluar
      gsap.fromTo(
        ".guide-header-anim",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.16,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 92%",
            end: "bottom top",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Desktop & Tablet (>= 768px): Animasi kartu muncul (masuk) dan keluar saat di-scroll
      mm.add("(min-width: 768px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".guide-step-card");
        if (!cards || cards.length === 0) return;

        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 45,
            scale: 0.94,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            stagger: 0.22,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsGridRef.current,
              start: "top 90%",
              end: "bottom top",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });

      // Mobile (< 768px): Animasi kartu muncul (masuk) dan keluar saat di-scroll di tampilan ponsel
      mm.add("(max-width: 767px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".guide-step-card");
        if (!cards || cards.length === 0) return;

        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 38,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsGridRef.current,
              start: "top 92%",
              end: "bottom top",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });

      // Refresh ScrollTrigger setelah render untuk mengantisipasi perubahan ukuran layout dinamis
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);

      return () => {
        clearTimeout(timer);
      };
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <section
      ref={containerRef}
      id="panduan-apk"
      className="relative py-14 sm:py-20 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <h2 className="guide-header-anim text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-display select-none py-1">
            <span className="inline-block text-3d-bubble-main">Panduan Mudah</span>{" "}
            <span className="inline-block text-3d-bubble-blue">Pasang APK</span>
          </h2>

          <p className="guide-header-anim text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Ikuti 4 langkah sederhana berikut untuk memasang aplikasi format APK langsung di smartphone atau tablet Android Anda dengan aman dan cepat.
          </p>

          {onOpenGuideModal && (
            <div className="guide-header-anim pt-1 flex justify-center">
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
        </div>

        {/* 4 Steps Bento / Grid Cards */}
        <div
          ref={cardsGridRef}
          className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {GUIDE_STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="guide-step-card group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-xs hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40 dark:hover:border-primary/40 transition-[border-color,box-shadow,background-color] duration-200 hover:-translate-y-1 will-change-transform"
              >
                <div>
                  {/* Top Row: 3D Icon Badge & Step Number */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] transition-transform duration-200 group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-display text-2xl font-black text-slate-200 dark:text-slate-800 group-hover:text-primary/30 dark:group-hover:text-blue-500/30 transition-colors select-none">
                      {item.step}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-4 text-base font-bold text-foreground tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Micro Tip */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 dark:text-emerald-400 mt-0.5" />
                  <span className="leading-snug">{item.tip}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
