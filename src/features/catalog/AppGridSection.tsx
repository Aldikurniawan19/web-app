"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, Smartphone, Globe, ArrowRight } from "lucide-react";
import { AppItem } from "@/types/store";
import { WebProjectItem } from "@/types/web-project";
import { AppCard } from "@/features/catalog/AppCard";
import { AppCardSkeleton } from "@/features/catalog/AppCardSkeleton";
import { WebProjectCard } from "@/features/catalog/WebProjectCard";
import { WebProjectCardSkeleton } from "@/features/catalog/WebProjectCardSkeleton";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShimmerTitleText } from "@/components/ui/ShimmerTitleText";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type CatalogFilterTab = "aplikasi" | "web";

interface AppGridSectionProps {
  apps: AppItem[];
  webProjects?: WebProjectItem[];
  isLoading?: boolean;
  onOpenDetail: (app: AppItem) => void;
  onOpenWebDetail?: (project: WebProjectItem) => void;
  onDownload: (app: AppItem) => void;
  onResetSearch?: () => void;
  limit?: number; // Batasi jumlah item yang tampil di beranda (misal: 3 item)
  activeTab?: CatalogFilterTab;
  onTabChange?: (tab: CatalogFilterTab) => void;
  hideFilterTabs?: boolean; // Sembunyikan tab jika berada di halaman khusus aplikasi atau khusus web
}

export function AppGridSection({
  apps,
  webProjects = [],
  isLoading = false,
  onOpenDetail,
  onOpenWebDetail,
  onDownload,
  onResetSearch,
  limit,
  activeTab: controlledTab,
  onTabChange: setControlledTab,
  hideFilterTabs = false,
}: AppGridSectionProps) {
  // State filter tab internal jika tidak dikontrol dari luar
  const [internalTab, setInternalTab] = useState<CatalogFilterTab>("aplikasi");
  const activeTab = controlledTab ?? internalTab;

  const setActiveTab = (tab: CatalogFilterTab) => {
    if (setControlledTab) {
      setControlledTab(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [minListHeight, setMinListHeight] = useState<number | null>(null);


  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Cek apakah mode pembatasan aktif (misal di halaman Beranda: maks 3)
  const isAppsLimited = Boolean(limit && apps.length > limit);
  const isWebLimited = Boolean(limit && webProjects.length > limit);

  const ITEMS_PER_PAGE = 7;
  // Paginasi hanya aktif jika tidak ada limitasi (misal di halaman katalog penuh)
  const shouldPaginate = !limit && activeTab === "aplikasi" && apps.length > ITEMS_PER_PAGE;
  const totalPages = shouldPaginate ? Math.ceil(apps.length / ITEMS_PER_PAGE) : 1;

  // Reset page saat tab atau jumlah item berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, apps.length]);

  // Data aplikasi yang ditampilkan (maksimal 3 jika ada limit, atau sesuai paginasi)
  const displayedApps = React.useMemo(() => {
    if (isAppsLimited) {
      return apps.slice(0, limit);
    }
    if (!shouldPaginate) return apps;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return apps.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [apps, currentPage, shouldPaginate, isAppsLimited, limit]);

  // Data projek web yang ditampilkan (maksimal 3 jika ada limit)
  const displayedWebProjects = React.useMemo(() => {
    if (isWebLimited) {
      return webProjects.slice(0, limit);
    }
    return webProjects;
  }, [webProjects, isWebLimited, limit]);

  // Kalkulasi & pertahankan tinggi stabil untuk 7 item penuh agar section tidak mengecil saat paginasi
  const updateStableHeight = React.useCallback(() => {
    if (!shouldPaginate || !cardsContainerRef.current) return;

    if (displayedApps.length === ITEMS_PER_PAGE) {
      const actualHeight = cardsContainerRef.current.offsetHeight;
      if (actualHeight > 0) {
        setMinListHeight(actualHeight);
        return;
      }
    }

    const singleCard = cardsContainerRef.current.querySelector<HTMLElement>(".app-card-item");
    if (singleCard) {
      const cardHeight = singleCard.offsetHeight;
      const isMobile = window.innerWidth < 640;
      const gap = isMobile ? 14 : 16;
      const calculatedHeight = cardHeight * ITEMS_PER_PAGE + gap * (ITEMS_PER_PAGE - 1);
      if (calculatedHeight > 0) {
        setMinListHeight(calculatedHeight);
      }
    }
  }, [displayedApps.length, shouldPaginate, ITEMS_PER_PAGE]);

  useLayoutEffect(() => {
    if (activeTab === "aplikasi" && shouldPaginate) {
      updateStableHeight();
    } else {
      setMinListHeight(null);
    }
  }, [updateStableHeight, displayedApps, activeTab, shouldPaginate]);

  useEffect(() => {
    if (!shouldPaginate || typeof window === "undefined" || activeTab !== "aplikasi") return;

    const handleResize = () => {
      updateStableHeight();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateStableHeight, shouldPaginate, activeTab]);

  // Sinkronisasi posisi ScrollTrigger di seluruh halaman saat data aplikasi berubah atau selesai dimuat
  useEffect(() => {
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading, apps.length, webProjects.length, activeTab]);

  const scrollToKatalogTop = () => {
    const katalogEl = document.getElementById("katalog");
    if (katalogEl) {
      const navbarHeight = 64;
      const topBuffer = 16;
      const elementPosition = katalogEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - topBuffer;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  // Animasi Muncul Kartu (Aplikasi atau Projek Web)
  useGSAP(
    () => {
      if (isLoading || !containerRef.current) return;

      const items = gsap.utils.toArray<HTMLElement>(
        activeTab === "aplikasi" ? ".app-card-item" : ".web-card-item"
      );
      if (!items || items.length === 0) return;

      gsap.fromTo(
        items,
        {
          opacity: 0,
          y: 24,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.05,
          ease: "power3.out",
          clearProps: "transform,opacity",
          onComplete: () => {
            setIsTransitioning(false);
          },
        }
      );
    },
    {
      dependencies: [activeTab, currentPage, displayedApps, displayedWebProjects, isLoading],
      scope: containerRef,
    }
  );

  // Animasi saat berpindah tab filter
  const handleTabChange = (newTab: CatalogFilterTab) => {
    if (newTab === activeTab || isTransitioning) return;
    setIsTransitioning(true);

    const currentCards = containerRef.current?.querySelectorAll(
      activeTab === "aplikasi" ? ".app-card-item" : ".web-card-item"
    );

    if (currentCards && currentCards.length > 0) {
      gsap.to(currentCards, {
        opacity: 0,
        y: 12,
        scale: 0.98,
        duration: 0.18,
        stagger: 0.015,
        ease: "power2.in",
        onComplete: () => {
          setActiveTab(newTab);
          setCurrentPage(1);
        },
      });
    } else {
      setActiveTab(newTab);
      setCurrentPage(1);
      setIsTransitioning(false);
    }
  };

  // Animasi Keluar saat membuka detail aplikasi
  const handleOpenDetailWithAnimation = (app: AppItem) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const cards = containerRef.current?.querySelectorAll(".app-card-item");
    if (cards && cards.length > 0) {
      gsap.to(cards, {
        opacity: 0,
        y: 16,
        scale: 0.98,
        duration: 0.2,
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

  // Animasi Keluar dan Perpindahan Halaman Paginasi + Auto Scroll ke Atas
  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || isTransitioning || newPage < 1 || newPage > totalPages) return;
    setIsTransitioning(true);

    scrollToKatalogTop();

    const cards = containerRef.current?.querySelectorAll(".app-card-item");
    if (cards && cards.length > 0) {
      gsap.to(cards, {
        opacity: 0,
        y: newPage > currentPage ? -14 : 14,
        scale: 0.98,
        duration: 0.2,
        stagger: 0.015,
        ease: "power2.in",
        onComplete: () => {
          setCurrentPage(newPage);
        },
      });
    } else {
      setCurrentPage(newPage);
      setIsTransitioning(false);
    }
  };

  // Animasi Keluar saat mereset pencarian
  const handleResetSearchWithAnimation = () => {
    if (isTransitioning || !onResetSearch) return;
    setIsTransitioning(true);

    const cards = containerRef.current?.querySelectorAll(
      activeTab === "aplikasi" ? ".app-card-item" : ".web-card-item"
    );
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
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header: Title, Segmented Tabs Filter & Total Count */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Dynamic Section Title */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-normal sm:text-3xl font-display select-none py-0.5">
              <span className="inline-block text-3d-bubble-main">
                {activeTab === "aplikasi" ? "Aplikasi" : "Projek Web"}
              </span>{" "}
              <ShimmerTitleText>
                {activeTab === "aplikasi" ? "Terbaru" : "Unggulan"}
              </ShimmerTitleText>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {activeTab === "aplikasi"
                ? "Paket aplikasi Android resmi siap unduh dan pasang langsung."
                : "Koleksi karya website interaktif dengan teknologi modern."}
            </p>
          </div>

          {/* Right: Segmented Filter Switch (Aplikasi & Web) + Total Count */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 self-start md:self-auto">
            {!hideFilterTabs && (
              <div className="inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleTabChange("aplikasi")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all select-none",
                    activeTab === "aplikasi"
                      ? "bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_0_#1e3a8a]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Aplikasi</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("web")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all select-none",
                    activeTab === "web"
                      ? "bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_0_#1e3a8a]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Web</span>
                </button>
              </div>
            )}

            {/* Total Count Badge */}
            {isLoading ? (
              <div className="h-4 w-28 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ) : (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {activeTab === "aplikasi"
                  ? `${apps.length} aplikasi`
                  : `${webProjects.length} projek web`}
              </span>
            )}
          </div>
        </div>

        {/* =========================================================================
            TAB 1: APLIKASI (List Horizontal)
            ========================================================================= */}
        {activeTab === "aplikasi" && (
          <div>
            {isLoading ? (
              <div
                className={cn(
                  "flex flex-col gap-3.5 sm:gap-4 w-full min-h-[320px] sm:min-h-[360px]",
                  shouldPaginate && "min-h-[1420px] sm:min-h-[960px] md:min-h-[920px]"
                )}
                style={{
                  minHeight: minListHeight ? `${minListHeight}px` : undefined,
                }}
              >
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={`skeleton-${idx}`} className="w-full">
                    <AppCardSkeleton delayMs={idx * 160} />
                  </div>
                ))}
              </div>
            ) : displayedApps.length > 0 ? (
              <div
                ref={cardsContainerRef}
                className={cn(
                  "flex flex-col gap-3.5 sm:gap-4 w-full justify-start min-h-[260px] sm:min-h-[300px]",
                  shouldPaginate && "min-h-[1420px] sm:min-h-[960px] md:min-h-[920px]"
                )}
                style={{
                  minHeight: minListHeight ? `${minListHeight}px` : undefined,
                }}
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
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center animate-in fade-in">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground font-display">
                  Tidak ada aplikasi ditemukan
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Coba gunakan kata kunci pencarian yang lain.
                </p>
                {onResetSearch && (
                  <button
                    type="button"
                    onClick={handleResetSearchWithAnimation}
                    className="mt-4 rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            )}

            {/* Tombol Lihat Selengkapnya (Muncul jika ada lebih dari 3 aplikasi di beranda) */}
            {isAppsLimited && (
              <div className="mt-10 flex justify-center">
                <Link
                  href="/aplikasi"
                  className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_4px_10px_rgba(37,99,235,0.25)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_3.5px_0_#1d4ed8,0_6px_16px_rgba(37,99,235,0.32)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#1d4ed8] transition-all select-none"
                >
                  <span>Lihat Selengkapnya</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}

            {/* Pagination Bar Aplikasi (Hanya pada halaman penuh tanpa limit) */}
            {!isLoading && shouldPaginate && totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2 animate-in fade-in">
                <button
                  type="button"
                  disabled={currentPage === 1 || isTransitioning}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-40"
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
                        ? "bg-gradient-to-b from-blue-500 via-primary to-blue-700 text-white shadow-md scale-105"
                        : "border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 hover:-translate-y-0.5"
                    )}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages || isTransitioning}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-40"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: PROJEK WEB (Card Persegi, Grid Responsif)
            ========================================================================= */}
        {activeTab === "web" && (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-h-[360px]">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={`web-skeleton-${idx}`} className="w-full">
                    <WebProjectCardSkeleton delayMs={idx * 160} />
                  </div>
                ))}
              </div>
            ) : displayedWebProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {displayedWebProjects.map((project) => (
                  <div
                    key={project.id}
                    className="web-card-item w-full will-change-transform"
                  >
                    <WebProjectCard
                      project={project}
                      onOpenDetail={(proj) => onOpenWebDetail?.(proj)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center animate-in fade-in">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50 text-primary">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground font-display">
                  Tidak ada projek web ditemukan
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Belum ada projek web yang sesuai dengan pencarian Anda.
                </p>
                {onResetSearch && (
                  <button
                    type="button"
                    onClick={handleResetSearchWithAnimation}
                    className="mt-4 rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            )}

            {/* Tombol Lihat Selengkapnya (Muncul jika ada lebih dari 3 projek web di beranda) */}
            {isWebLimited && (
              <div className="mt-10 flex justify-center">
                <Link
                  href="/projek-web"
                  className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_4px_10px_rgba(37,99,235,0.25)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_3.5px_0_#1d4ed8,0_6px_16px_rgba(37,99,235,0.32)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#1d4ed8] transition-all select-none"
                >
                  <span>Lihat Selengkapnya</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

    </section>
  );
}
