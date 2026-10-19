"use client";

import React, { useRef } from "react";
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
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/Button";
import { ShimmerTitleText } from "@/components/ui/ShimmerTitleText";

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

      // Animasi Aliran Cahaya pada Border Card 1 sampai 4 secara berurutan
      const beamWrappers = gsap.utils.toArray<HTMLElement>(".guide-card-border-beam");
      const beamSpinners = gsap.utils.toArray<HTMLElement>(".guide-card-border-spinner");

      if (beamWrappers.length > 0 && beamSpinners.length > 0) {
        gsap.set(beamSpinners, {
          xPercent: -50,
          yPercent: -50,
          top: "50%",
          left: "50%",
          transformOrigin: "50% 50%",
        });

        const flowTimeline = gsap.timeline({
          repeat: -1,
          repeatDelay: 1.2,
          scrollTrigger: {
            trigger: cardsGridRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play pause resume pause",
          },
        });

        const cardDuration = 1.35;
        const transitionOverlap = 0.12;
        const cards = gsap.utils.toArray<HTMLElement>(".guide-step-card");

        beamWrappers.forEach((wrapper, idx) => {
          const spinner = beamSpinners[idx];
          if (!wrapper || !spinner) return;

          const cardStartTime = idx * (cardDuration - transitionOverlap);

          // 1. Munculkan cahaya border kartu ini
          flowTimeline.fromTo(
            wrapper,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.16,
              ease: "power2.out",
            },
            cardStartTime
          );

          // 2. Putar berkas cahaya melintasi seluruh 4 sisi & sudut border kartu (360 derajat penuh)
          flowTimeline.fromTo(
            spinner,
            {
              rotation: 0,
              xPercent: -50,
              yPercent: -50,
              transformOrigin: "50% 50%",
            },
            {
              rotation: 360,
              xPercent: -50,
              yPercent: -50,
              transformOrigin: "50% 50%",
              duration: cardDuration,
              ease: "linear",
            },
            cardStartTime
          );

          // 3. Redupkan border kartu secara halus saat cahaya berpindah ke kartu berikutnya
          flowTimeline.to(
            wrapper,
            {
              opacity: 0,
              duration: 0.2,
              ease: "power2.in",
            },
            cardStartTime + cardDuration - 0.16
          );

          // 4. Animasi Kilauan pada Nomor Urut di Kanan Atas Kartu
          if (cards[idx]) {
            const cardEl = cards[idx];
            const stepNumber = cardEl.querySelector(".guide-step-number");
            const stepSparkle = cardEl.querySelector(".guide-step-sparkle");

            if (stepNumber) {
              flowTimeline.fromTo(
                stepNumber,
                { backgroundPosition: "200% 0" },
                {
                  backgroundPosition: "-60% 0",
                  duration: 1.15,
                  ease: "power2.inOut",
                },
                cardStartTime
              );
            }

            if (stepSparkle) {
              flowTimeline.fromTo(
                stepSparkle,
                { scale: 0, opacity: 0, rotation: 0 },
                {
                  scale: 1.25,
                  opacity: 1,
                  rotation: 50,
                  duration: 0.32,
                  ease: "back.out(2)",
                },
                cardStartTime + 0.32
              );
              flowTimeline.to(
                stepSparkle,
                {
                  scale: 0,
                  opacity: 0,
                  rotation: 110,
                  duration: 0.28,
                  ease: "power2.in",
                },
                cardStartTime + 0.64
              );
            }
          }

          // 5. Animasi Cahaya pada Elemen Penghubung (Connector) ke Kartu Berikutnya
          if (idx < beamWrappers.length - 1 && cards[idx]) {
            const cardEl = cards[idx];
            const trackBeams = cardEl.querySelectorAll(".guide-connector-track-beam");
            const nodes = cardEl.querySelectorAll(".guide-connector-node");
            const icons = cardEl.querySelectorAll(".guide-connector-icon");

            const connStartTime = cardStartTime + 1.05;

            // Berkas cahaya di garis track penghubung menyala
            flowTimeline.fromTo(
              trackBeams,
              { opacity: 0 },
              { opacity: 1, duration: 0.18, ease: "power2.out" },
              connStartTime
            );
            flowTimeline.to(
              trackBeams,
              { opacity: 0, duration: 0.22, ease: "power2.in" },
              connStartTime + 0.2
            );

            // Node lingkaran penghubung membesar dan berpendar
            flowTimeline.fromTo(
              nodes,
              { scale: 1 },
              {
                scale: 1.22,
                borderColor: "#38bdf8",
                boxShadow: "0 0 12px rgba(56, 189, 248, 0.8)",
                duration: 0.2,
                ease: "back.out(2)",
              },
              connStartTime
            );
            flowTimeline.to(
              nodes,
              {
                scale: 1,
                borderColor: "",
                boxShadow: "none",
                clearProps: "scale,borderColor,boxShadow",
                duration: 0.25,
                ease: "power2.in",
              },
              connStartTime + 0.25
            );

            // Ikon panah berubah warna menjadi cyan terang
            flowTimeline.fromTo(
              icons,
              { color: "" },
              { color: "#38bdf8", duration: 0.18 },
              connStartTime
            );
            flowTimeline.to(
              icons,
              { color: "", clearProps: "color", duration: 0.25 },
              connStartTime + 0.25
            );
          }
        });
      }

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
            <ShimmerTitleText>Pasang APK</ShimmerTitleText>
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
                {/* Animasi Berkas Cahaya Mengalir di Border (Hanya pada Border) */}
                <div className="guide-card-border-beam" aria-hidden="true">
                  <div className="guide-card-border-spinner" />
                </div>

                <div>
                  {/* Top Row: 3D Icon Badge & Step Number */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] transition-transform duration-200 group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                    {/* Step Number Berkilau di Kanan Atas */}
                    <div className="relative inline-flex items-center select-none py-0.5">
                      <span className="guide-step-number font-display text-2xl sm:text-3xl font-black select-none">
                        {item.step}
                      </span>
                      {/* Bintang Kilau (Sparkle Starburst) */}
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="guide-step-sparkle pointer-events-none absolute -top-1 -right-2.5 h-3.5 w-3.5 text-sky-400 dark:text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] opacity-0 z-10"
                        aria-hidden="true"
                      >
                        <path d="M12 0L14.3 8.7L23 11L14.3 13.3L12 22L9.7 13.3L1 11L9.7 8.7L12 0Z" />
                      </svg>
                    </div>
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

                {/* Penghubung Antar Card (Step Connectors) */}
                {index < GUIDE_STEPS.length - 1 && (
                  <>
                    {/* 1. Desktop Connector (lg:grid-cols-4): Bridge horizontal ke card berikutnya */}
                    <div
                      className="guide-connector-desktop hidden lg:flex absolute left-[calc(100%+12px)] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none"
                      aria-hidden="true"
                    >
                      {/* Track Garis Penghubung */}
                      <div className="w-6 h-[2px] bg-slate-200 dark:bg-slate-800 absolute top-1/2 -translate-y-1/2" />
                      {/* Cahaya Berkas Mengalir di Garis Track */}
                      <div className="guide-connector-track-beam w-6 h-[2px] bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 absolute top-1/2 -translate-y-1/2 opacity-0" />

                      {/* Node Titik Penghubung Tengah */}
                      <div className="guide-connector-node relative flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <ChevronRight className="guide-connector-icon h-4 w-4 text-slate-400 dark:text-slate-500 transition-colors" />
                      </div>
                    </div>

                    {/* 2. Tablet Connector (md:grid-cols-2): */}
                    {/* Antara Card 1-2 & Card 3-4 (horizontal) */}
                    {(index === 0 || index === 2) && (
                      <div
                        className="guide-connector-tablet hidden md:flex lg:hidden absolute left-[calc(100%+12px)] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none"
                        aria-hidden="true"
                      >
                        <div className="w-6 h-[2px] bg-slate-200 dark:bg-slate-800 absolute top-1/2 -translate-y-1/2" />
                        <div className="guide-connector-track-beam w-6 h-[2px] bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 absolute top-1/2 -translate-y-1/2 opacity-0" />
                        <div className="guide-connector-node relative flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <ChevronRight className="guide-connector-icon h-4 w-4 text-slate-400 dark:text-slate-500 transition-colors" />
                        </div>
                      </div>
                    )}
                    {/* Antara Card 2-3 (vertical row transition di tablet) */}
                    {index === 1 && (
                      <div
                        className="guide-connector-tablet hidden md:flex lg:hidden absolute left-1/2 top-[calc(100%+12px)] -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none"
                        aria-hidden="true"
                      >
                        <div className="h-6 w-[2px] bg-slate-200 dark:bg-slate-800 absolute left-1/2 -translate-x-1/2" />
                        <div className="guide-connector-track-beam h-6 w-[2px] bg-gradient-to-b from-blue-500 via-sky-400 to-blue-600 absolute left-1/2 -translate-x-1/2 opacity-0" />
                        <div className="guide-connector-node relative flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <ChevronDown className="guide-connector-icon h-4 w-4 text-slate-400 dark:text-slate-500 transition-colors" />
                        </div>
                      </div>
                    )}

                    {/* 3. Mobile Connector (grid-cols-1): Panah vertikal antar card */}
                    <div
                      className="guide-connector-mobile flex md:hidden absolute left-1/2 top-[calc(100%+8px)] sm:top-[calc(100%+12px)] -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none"
                      aria-hidden="true"
                    >
                      <div className="h-4 sm:h-6 w-[2px] bg-slate-200 dark:bg-slate-800 absolute left-1/2 -translate-x-1/2" />
                      <div className="guide-connector-track-beam h-4 sm:h-6 w-[2px] bg-gradient-to-b from-blue-500 via-sky-400 to-blue-600 absolute left-1/2 -translate-x-1/2 opacity-0" />
                      <div className="guide-connector-node relative flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                        <ChevronDown className="guide-connector-icon h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-colors" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
