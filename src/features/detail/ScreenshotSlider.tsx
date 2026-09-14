"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Search,
  Plus,
} from "lucide-react";
import { AppScreenshot } from "@/types/store";
import { cn } from "@/lib/utils";

interface ScreenshotSliderProps {
  appName: string;
  screenshots: AppScreenshot[];
}

export function ScreenshotSlider({ appName, screenshots }: ScreenshotSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const totalSlides = 4;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const minSwipeDistance = 40;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  const mockups = [
    // Screen 1: Semua Catatan (Light)
    <div
      key="screen-1"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm text-xs space-y-2.5 h-full"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Semua Catatan</span>
        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
          <Search className="h-3 w-3" />
          <Plus className="h-3 w-3" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/40 p-2 border border-blue-100 dark:border-blue-900/40">
          <div className="font-semibold text-blue-900 dark:text-blue-300 text-[11px]">Tugas Kuliah</div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 truncate">Penyelesaian bab 3 laporan...</div>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
          <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Ide Aplikasi</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Fitur sinkronisasi P2P offline...</div>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
          <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Rencana Liburan</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Daftar perlengkapan & tiket...</div>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
          <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Catatan Penting</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Daftar kontak darurat...</div>
        </div>
      </div>
    </div>,

    // Screen 2: Editor Catatan
    <div
      key="screen-2"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm text-xs space-y-2.5 h-full"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Tulis Catatan...</span>
        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Tersimpan</span>
      </div>
      <div className="flex gap-1 border-b border-slate-100 dark:border-slate-800 pb-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
        <span className="font-bold">B</span>
        <span className="italic">I</span>
        <span className="underline">U</span>
        <span>List</span>
        <span>Check</span>
      </div>
      <div className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
        <p className="font-semibold text-slate-800 dark:text-slate-200">Rapat Perencanaan Proyek</p>
        <p>1. Pembagian modul antarmuka</p>
        <p>2. Integrasi penyimpanan cloud</p>
        <p>3. Pengujian performa RAM</p>
      </div>
    </div>,

    // Screen 3: Kalender & Jadwal
    <div
      key="screen-3"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm text-xs space-y-2 h-full"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Kalender</span>
        <span className="text-[10px] font-semibold text-primary">Juni 2026</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-slate-500 dark:text-slate-400 pt-1">
        <span className="font-bold">M</span>
        <span className="font-bold">S</span>
        <span className="font-bold">S</span>
        <span className="font-bold">R</span>
        <span className="font-bold">K</span>
        <span className="font-bold">J</span>
        <span className="font-bold">S</span>
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "py-0.5 rounded",
              i === 13
                ? "bg-primary text-white font-bold"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            {i + 1}
          </span>
        ))}
      </div>
      <div className="rounded bg-amber-50 dark:bg-amber-950/40 p-1.5 text-[9px] text-amber-800 dark:text-amber-300 font-medium border border-amber-100 dark:border-amber-900/40">
        Deadline: Laporan Akhir (14 Jun)
      </div>
    </div>,

    // Screen 4: Semua Catatan (Dark Mode)
    <div
      key="screen-4"
      className="rounded-xl border border-slate-800 bg-slate-900 p-3.5 shadow-sm text-xs space-y-2.5 text-slate-200 h-full"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-bold text-white text-[11px]">Semua Catatan (Dark)</span>
        <Moon className="h-3 w-3 text-slate-400" />
      </div>
      <div className="space-y-1.5">
        <div className="rounded-lg bg-blue-950/40 p-2 border border-blue-800/40">
          <div className="font-semibold text-blue-300 text-[11px]">Tugas Kuliah</div>
          <div className="text-[10px] text-slate-400 truncate">Penyelesaian bab 3 laporan...</div>
        </div>
        <div className="rounded-lg bg-slate-800/60 p-2 border border-slate-800">
          <div className="font-semibold text-white text-[11px]">Ide Aplikasi</div>
          <div className="text-[10px] text-slate-400 truncate">Fitur sinkronisasi P2P offline...</div>
        </div>
        <div className="rounded-lg bg-slate-800/60 p-2 border border-slate-800">
          <div className="font-semibold text-white text-[11px]">Rencana Liburan</div>
          <div className="text-[10px] text-slate-400 truncate">Daftar perlengkapan & tiket...</div>
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-6 transition-colors duration-200">
      {/* Mobile Slider View (One card at a time with swipe & controls) */}
      <div className="block sm:hidden">
        <div
          className="relative overflow-hidden rounded-xl"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Slider Track */}
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {mockups.map((mockup, idx) => (
              <div key={idx} className="w-full min-w-full flex-shrink-0">
                {mockup}
              </div>
            ))}
          </div>

          {/* Navigation Arrows on Mobile */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md backdrop-blur-sm active:scale-90 transition-transform"
            aria-label="Tangkapan layar sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md backdrop-blur-sm active:scale-90 transition-transform"
            aria-label="Tangkapan layar berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Pagination Dots (Mobile) */}
        <div className="mt-3.5 flex items-center justify-center gap-1.5">
          {mockups.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Lihat tangkapan layar ${idx + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                currentIndex === idx
                  ? "w-6 bg-primary"
                  : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop View (Full 4-column responsive grid) */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockups.map((mockup, idx) => (
          <div key={idx} className="w-full">
            {mockup}
          </div>
        ))}
      </div>
    </div>
  );
}
