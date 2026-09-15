"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { AppItem } from "@/types/store";
import { AppCard } from "@/features/catalog/AppCard";
import { AppCardSkeleton } from "@/features/catalog/AppCardSkeleton";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface AppGridSectionProps {
  apps: AppItem[];
  isLoading?: boolean;
  onOpenDetail: (app: AppItem) => void;
  onDownload: (app: AppItem) => void;
  onResetSearch?: () => void;
}

export function AppGridSection({
  apps,
  isLoading = false,
  onOpenDetail,
  onDownload,
  onResetSearch,
}: AppGridSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 7;
  const shouldPaginate = apps.length > ITEMS_PER_PAGE;
  const totalPages = shouldPaginate ? Math.ceil(apps.length / ITEMS_PER_PAGE) : 1;

  // Pastikan currentPage valid saat jumlah data berubah
  React.useEffect(() => {
    setCurrentPage(1);
  }, [apps.length]);

  // Potong list data sesuai halaman aktif jika data > 7
  const displayedApps = React.useMemo(() => {
    if (!shouldPaginate) return apps;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return apps.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [apps, currentPage, shouldPaginate]);

  // Animasi Muncul saat Scroll (Responsive: Stagger di Desktop, Individual saat scroll di Mobile)
  useGSAP(
    () => {
      if (isLoading || !containerRef.current || displayedApps.length === 0) return;

      const mm = gsap.matchMedia();

      // Desktop & Tablet (>= 768px): Animasi berurutan dari atas ke bawah secara anggun dan mulus
      mm.add("(min-width: 768px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".app-card-item");
        if (!cards || cards.length === 0) return;

        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 40,
            scale: 0.96,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsContainerRef.current,
              start: "top 86%",
              toggleActions: "play none none reverse",
            },
            clearProps: "transform,opacity",
          }
        );
      });

      // Mobile (< 768px): Animasi dipicu satu per satu tepat saat masing-masing kartu aplikasi di-scroll
      mm.add("(max-width: 767px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".app-card-item");
        if (!cards || cards.length === 0) return;

        cards.forEach((card) => {
          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 35,
              scale: 0.96,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%", // Aktif saat posisi scroll tepat berada pada kartu tersebut
                toggleActions: "play none none reverse",
              },
              clearProps: "transform,opacity",
            }
          );
        });
      });

      ScrollTrigger.refresh();
      setIsTransitioning(false);
    },
    { dependencies: [displayedApps, currentPage, isLoading], scope: containerRef }
  );

  // Animasi Keluar (Exit Animation) saat membuka detail aplikasi
  const handleOpenDetailWithAnimation = (app: AppItem) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const cards = containerRef.current?.querySelectorAll(".app-card-item");
    if (cards && cards.length > 0) {
      gsap.to(cards, {
        opacity: 0,
        y: 16,
        scale: 0.98,
        duration: 0.22,
        stagger: 0.02,
        ease: "power2.in",
        onComplete: () => {
          onOpenDetail(app);
          setIsTransitioning(false);
        },
      });
    } else {
      onOpenDetail(app);
      setIsTransitioning(false);
    }
  };

  // Animasi Keluar (Exit Animation) saat berpindah halaman paginasi
  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || isTransitioning || newPage < 1 || newPage > totalPages) return;
    setIsTransitioning(true);

    const cards = containerRef.current?.querySelectorAll(".app-card-item");
    if (cards && cards.length > 0) {
      gsap.to(cards, {
        opacity: 0,
        y: newPage > currentPage ? -18 : 18,
        scale: 0.98,
        duration: 0.22,
        stagger: 0.02,
        ease: "power2.in",
        onComplete: () => {
          setCurrentPage(newPage);
          // Scroll halus ke header katalog
          const katalogEl = document.getElementById("katalog");
          if (katalogEl) {
            katalogEl.scrollIntoView({ behavior: "smooth" });
          }
        },
      });
    } else {
      setCurrentPage(newPage);
    }
  };

  // Animasi Keluar saat mereset pencarian
  const handleResetSearchWithAnimation = () => {
    if (isTransitioning || !onResetSearch) return;
    setIsTransitioning(true);

    const cards = containerRef.current?.querySelectorAll(".app-card-item");
    if (cards && cards.length > 0) {
      gsap.to(cards, {
        opacity: 0,
        y: 12,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          onResetSearch();
          setIsTransitioning(false);
        },
      });
    } else {
      onResetSearch();
      setIsTransitioning(false);
    }
  };

  return (
    <section ref={containerRef} id="katalog" className="py-12 sm:py-16 bg-background w-full">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header: Title & Total Count */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl font-display select-none py-0.5">
              <span className="inline-block text-3d-bubble-main">Aplikasi</span>{" "}
              <span className="inline-block text-3d-bubble-blue">Terbaru</span>
            </h2>
          </div>
          {isLoading ? (
            <div className="h-4 w-28 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ) : apps.length > 0 ? (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {apps.length} aplikasi ditemukan
            </span>
          ) : null}
        </div>

        {/* Loading Skeleton View */}
        {isLoading ? (
          <div className="mt-8 flex flex-col gap-3.5 sm:gap-4 w-full">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="w-full">
                <AppCardSkeleton />
              </div>
            ))}
          </div>
        ) : displayedApps.length > 0 ? (
          /* Full Width Horizontal Rectangular App Cards List */
          <div
            ref={cardsContainerRef}
            className="mt-8 flex flex-col gap-3.5 sm:gap-4 w-full"
          >
            {displayedApps.map((app) => (
              <div
                key={app.id}
                className="app-card-item w-full will-change-transform"
              >
                <AppCard
                  app={app}
                  onOpenDetail={handleOpenDetailWithAnimation}
                  onDownload={onDownload}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center animate-in fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              Tidak ada aplikasi ditemukan
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Coba gunakan kata kunci pencarian yang lain.
            </p>
            {onResetSearch && (
              <button
                type="button"
                onClick={handleResetSearchWithAnimation}
                className="mt-4 rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_3.5px_0_#1d4ed8,0_5px_10px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#1d4ed8] transition-all"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        )}

        {/* Pagination Bar: Hanya muncul jika tidak loading dan list aplikasi > 7 */}
        {!isLoading && shouldPaginate && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 animate-in fade-in">
            <button
              type="button"
              disabled={currentPage === 1 || isTransitioning}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_0_#cbd5e1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#cbd5e1] transition-all disabled:opacity-40 disabled:hover:translate-y-0"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                disabled={isTransitioning}
                onClick={() => handlePageChange(pageNum)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all",
                  currentPage === pageNum
                    ? "bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] scale-105"
                    : "border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_0_#cbd5e1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0.5"
                )}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages || isTransitioning}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_0_#cbd5e1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#cbd5e1] transition-all disabled:opacity-40 disabled:hover:translate-y-0"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
