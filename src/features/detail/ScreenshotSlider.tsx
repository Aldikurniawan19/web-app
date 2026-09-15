"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Search,
  Plus,
  Maximize2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { AppScreenshot } from "@/types/store";
import { cn } from "@/lib/utils";

interface ScreenshotSliderProps {
  appName: string;
  screenshots?: AppScreenshot[];
}

export function ScreenshotSlider({ appName, screenshots = [] }: ScreenshotSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [desktopIndex, setDesktopIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Periksa apakah ada screenshot nyata yang memiliki imageUrl
  const realScreenshots = screenshots.filter((s) => Boolean(s.imageUrl));
  const hasRealScreenshots = realScreenshots.length > 0;

  const totalItems = hasRealScreenshots ? realScreenshots.length : 4;
  const maxDesktopIndex = Math.max(0, totalItems - 4);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
  };

  const handleDesktopPrev = () => {
    setDesktopIndex((prev) => Math.max(0, prev - 1));
  };

  const handleDesktopNext = () => {
    setDesktopIndex((prev) => Math.min(maxDesktopIndex, prev + 1));
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

  // Fallback Mockups untuk aplikasi bawaan tanpa upload gambar
  const fallbackMockups = [
    // Screen 1: Semua Catatan (Light)
    <div
      key="screen-1"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs text-xs space-y-2.5 h-full"
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
      </div>
    </div>,

    // Screen 2: Editor Catatan
    <div
      key="screen-2"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs text-xs space-y-2.5 h-full"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Tulis Catatan...</span>
        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Tersimpan</span>
      </div>
      <div className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
        <p className="font-semibold text-slate-800 dark:text-slate-200">Rapat Perencanaan Proyek</p>
        <p>1. Pembagian modul antarmuka</p>
        <p>2. Integrasi penyimpanan cloud</p>
      </div>
    </div>,

    // Screen 3: Kalender & Jadwal
    <div
      key="screen-3"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs text-xs space-y-2 h-full"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Kalender</span>
        <span className="text-[10px] font-semibold text-primary">Juni 2026</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-slate-500 dark:text-slate-400 pt-1">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "py-0.5 rounded",
              i === 6 ? "bg-primary text-white font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </div>,

    // Screen 4: Semua Catatan (Dark Mode)
    <div
      key="screen-4"
      className="rounded-xl border border-slate-800 bg-slate-900 p-3.5 shadow-xs text-xs space-y-2.5 text-slate-200 h-full"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-bold text-white text-[11px]">Semua Catatan (Dark)</span>
        <Moon className="h-3 w-3 text-slate-400" />
      </div>
      <div className="space-y-1.5">
        <div className="rounded-lg bg-blue-950/40 p-2 border border-blue-800/40">
          <div className="font-semibold text-blue-300 text-[11px]">Tugas Kuliah</div>
          <div className="text-[10px] text-slate-400 truncate">Penyelesaian bab 3...</div>
        </div>
      </div>
    </div>,
  ];

  return (
    <>
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-6 transition-colors duration-200">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white font-display select-none">
              Tangkapan Layar & Antarmuka
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pratinjau tampilan aplikasi {appName} pada perangkat ponsel.
            </p>
          </div>
          {hasRealScreenshots && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {realScreenshots.length} Gambar
              </span>
              {totalItems > 4 && (
                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDesktopPrev}
                    disabled={desktopIndex === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                    aria-label="Tangkapan layar sebelumnya"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDesktopNext}
                    disabled={desktopIndex >= maxDesktopIndex}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                    aria-label="Tangkapan layar berikutnya"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 1. Mobile Slider View (Swipeable with buttons) */}
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
              {hasRealScreenshots
                ? realScreenshots.map((sc, idx) => (
                    <div key={sc.id || idx} className="w-full min-w-full flex-shrink-0 px-1">
                      <div
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                      >
                        <div className="aspect-[9/16] max-h-80 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <img
                            src={sc.imageUrl}
                            alt={sc.title || `${appName} screenshot ${idx + 1}`}
                            className="h-full w-full object-contain select-none"
                          />
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {sc.title}
                          </h4>
                          {sc.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {sc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                : fallbackMockups.map((mockup, idx) => (
                    <div key={idx} className="w-full min-w-full flex-shrink-0">
                      {mockup}
                    </div>
                  ))}
            </div>

            {/* Navigation Arrows on Mobile */}
            {totalItems > 1 && (
              <>
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
              </>
            )}
          </div>

          {/* Pagination Dots (Mobile) */}
          {totalItems > 1 && (
            <div className="mt-3.5 flex items-center justify-center gap-1.5">
              {Array.from({ length: totalItems }).map((_, idx) => (
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
          )}
        </div>

        {/* 2. Desktop View (Menampilkan tepat 4 gambar, jika > 4 menjadi slider) */}
        <div className="hidden sm:block relative">
          <div className="overflow-hidden -mx-2 py-1 px-1">
            <div
              className="flex transition-transform duration-350 ease-out"
              style={{
                transform: `translateX(-${desktopIndex * 25}%)`,
              }}
            >
              {hasRealScreenshots
                ? realScreenshots.map((sc, idx) => (
                    <div
                      key={sc.id || idx}
                      className="w-1/4 flex-shrink-0 px-2"
                    >
                      <div
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative cursor-pointer flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-primary/50 hover:shadow-md transition-all hover:-translate-y-0.5 h-full"
                      >
                        <div className="relative aspect-[9/16] max-h-72 w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center p-2">
                          <img
                            src={sc.imageUrl}
                            alt={sc.title || `${appName} screenshot ${idx + 1}`}
                            className="h-full w-full object-contain select-none group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs">
                              <Maximize2 className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {sc.title}
                          </h4>
                          {sc.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {sc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                : fallbackMockups.map((mockup, idx) => (
                    <div key={idx} className="w-1/4 flex-shrink-0 px-2">
                      {mockup}
                    </div>
                  ))}
            </div>
          </div>

          {/* Tombol Navigasi Mengambang Desktop (Jika ada lebih dari 4 gambar) */}
          {totalItems > 4 && (
            <>
              {desktopIndex > 0 && (
                <button
                  type="button"
                  onClick={handleDesktopPrev}
                  className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md hover:scale-110 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                  aria-label="Tangkapan layar sebelumnya"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {desktopIndex < maxDesktopIndex && (
                <button
                  type="button"
                  onClick={handleDesktopNext}
                  className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md hover:scale-110 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                  aria-label="Tangkapan layar berikutnya"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </>
          )}

          {/* Indikator Titik Paginasi Desktop (Jika ada lebih dari 4 gambar) */}
          {totalItems > 4 && (
            <div className="mt-4 flex items-center justify-center gap-1.5">
              {Array.from({ length: maxDesktopIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDesktopIndex(idx)}
                  aria-label={`Lihat slide ${idx + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    desktopIndex === idx
                      ? "w-6 bg-primary"
                      : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && hasRealScreenshots && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Tutup pratinjau"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Lightbox Image */}
            <div className="overflow-hidden rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl p-2 max-h-[75vh] flex items-center justify-center">
              <img
                src={realScreenshots[lightboxIndex].imageUrl}
                alt={realScreenshots[lightboxIndex].title}
                className="max-h-[70vh] w-auto object-contain rounded-xl select-none"
              />
            </div>

            {/* Lightbox Caption */}
            <div className="mt-3 text-center text-white space-y-1">
              <h4 className="text-sm font-bold">
                {realScreenshots[lightboxIndex].title}
              </h4>
              {realScreenshots[lightboxIndex].description && (
                <p className="text-xs text-slate-300">
                  {realScreenshots[lightboxIndex].description}
                </p>
              )}
            </div>

            {/* Prev / Next buttons inside Lightbox */}
            {realScreenshots.length > 1 && (
              <div className="absolute inset-y-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-2 sm:-mx-12">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev === 0 ? realScreenshots.length - 1 : (prev || 0) - 1
                    )
                  }
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev === realScreenshots.length - 1 ? 0 : (prev || 0) + 1
                    )
                  }
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
