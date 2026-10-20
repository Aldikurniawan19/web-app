"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingBottomBar } from "@/components/layout/FloatingBottomBar";
import { AppCard } from "@/features/catalog/AppCard";
import { AppCardSkeleton } from "@/features/catalog/AppCardSkeleton";
import { AppDetailView } from "@/features/detail/AppDetailView";
import { DownloadModal } from "@/features/download/DownloadModal";
import { InstallGuideModal } from "@/features/guide/InstallGuideModal";
import { AppItem, AppCategory } from "@/types/store";
import { CATEGORIES } from "@/constants/app-store-data";
import { ShimmerTitleText } from "@/components/ui/ShimmerTitleText";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Search, Sparkles, ChevronLeft, ChevronRight, Smartphone, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/context/CatalogContext";

export default function AllAppsPage() {
  const { apps, isLoading } = useCatalog();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [activeView, setActiveView] = useState<"catalog" | "detail">("catalog");
  const [downloadModalApp, setDownloadModalApp] = useState<AppItem | null>(null);
  const [guideModalApp, setGuideModalApp] = useState<AppItem | null>(null);

  const ITEMS_PER_PAGE = 7;

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery.trim() === "" ||
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.developer.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "Semua" || app.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [apps, searchQuery, selectedCategory]);

  const shouldPaginate = filteredApps.length > ITEMS_PER_PAGE;
  const totalPages = shouldPaginate ? Math.ceil(filteredApps.length / ITEMS_PER_PAGE) : 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const displayedApps = useMemo(() => {
    if (!shouldPaginate) return filteredApps;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApps.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredApps, currentPage, shouldPaginate]);

  const handleOpenDetail = (app: AppItem) => {
    setSelectedApp(app);
    setActiveView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCatalog = () => {
    setActiveView("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = (app: AppItem) => {
    setDownloadModalApp(app);
    setGuideModalApp(app);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* 1. Header & Navigation */}
      <Navbar activeNav="aplikasi" />

      {/* 2. Main Content Body */}
      <main className="flex-1 w-full">
        {activeView === "catalog" ? (
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
            <>
              {/* Breadcrumb & Title */}
              <div className="space-y-4">
                <Breadcrumb
                  items={[
                    { label: "Beranda", icon: Home, href: "/" },
                    { label: "Katalog Aplikasi", isCurrent: true },
                  ]}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-normal font-display py-0.5">
                      <span className="inline-block text-3d-bubble-main">Katalog Seluruh</span>{" "}
                      <ShimmerTitleText>Aplikasi</ShimmerTitleText>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Temukan dan unduh seluruh paket aplikasi Android resmi yang tersedia di ekosistem AllProjects.
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-start sm:self-auto">
                    {filteredApps.length} aplikasi ditemukan
                  </span>
                </div>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan nama aplikasi atau developer..."
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all select-none",
                        selectedCategory === cat
                          ? "bg-primary text-white shadow-sm"
                          : "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apps List */}
              {isLoading ? (
                <div className="flex flex-col gap-4 w-full min-h-[360px]">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={`skel-${idx}`} className="w-full">
                      <AppCardSkeleton delayMs={idx * 150} />
                    </div>
                  ))}
                </div>
              ) : displayedApps.length > 0 ? (
                <div className="flex flex-col gap-4 w-full">
                  {displayedApps.map((app) => (
                    <div key={app.id} className="w-full">
                      <AppCard
                        app={app}
                        onOpenDetail={handleOpenDetail}
                        onDownload={handleDownload}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center animate-in fade-in">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50 text-primary">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground font-display">
                    Tidak ada aplikasi ditemukan
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Coba sesuaikan kata kunci pencarian atau pilih kategori lain.
                  </p>
                  {(searchQuery || selectedCategory !== "Semua") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("Semua");
                      }}
                      className="mt-4 rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              )}

              {/* Pagination Bar */}
              {!isLoading && shouldPaginate && totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2 animate-in fade-in">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(currentPage - 1);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-40"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 120, behavior: "smooth" });
                      }}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all",
                        currentPage === pageNum
                          ? "bg-primary text-white shadow-md scale-105"
                          : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:-translate-y-0.5"
                      )}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-40"
                    aria-label="Halaman berikutnya"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : selectedApp ? (
            <AppDetailView
              app={selectedApp}
              onBack={handleBackToCatalog}
              onDownload={handleDownload}
              breadcrumbs={[
                {
                  label: "Beranda",
                  icon: Home,
                  href: "/",
                },
                {
                  label: "Katalog Aplikasi",
                  onClick: handleBackToCatalog,
                },
                {
                  label: `Detail ${selectedApp.name}`,
                  isCurrent: true,
                },
              ]}
            />
          ) : null}
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* Mobile Floating Bar */}
      <FloatingBottomBar activeNav="aplikasi" />

      {/* Modals */}
      <DownloadModal
        app={downloadModalApp}
        isOpen={downloadModalApp !== null}
        onClose={() => setDownloadModalApp(null)}
        onOpenGuide={(app) => setGuideModalApp(app)}
      />

      <InstallGuideModal
        app={guideModalApp}
        isOpen={guideModalApp !== null}
        onClose={() => setGuideModalApp(null)}
      />
    </div>
  );
}
