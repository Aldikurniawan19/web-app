"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingBottomBar } from "@/components/layout/FloatingBottomBar";
import { WebProjectCard } from "@/features/catalog/WebProjectCard";
import { WebProjectCardSkeleton } from "@/features/catalog/WebProjectCardSkeleton";
import { WebProjectDetailView } from "@/features/detail/WebProjectDetailView";
import { WebProjectItem } from "@/types/web-project";
import { ShimmerTitleText } from "@/components/ui/ShimmerTitleText";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Search, Globe, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/context/CatalogContext";

const WEB_PAGE_CATEGORIES = [
  "Semua",
  "Web App",
  "SaaS",
  "Landing Page",
  "E-Commerce",
  "Portfolio",
  "Dashboard",
  "Fintech Dashboard",
  "Cloud Platform",
  "Produktivitas",
];

export default function AllWebProjectsPage() {
  const { webProjects: projects, isLoading } = useCatalog();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedProject, setSelectedProject] = useState<WebProjectItem | null>(null);
  const [activeView, setActiveView] = useState<"catalog" | "detail">("catalog");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery.trim() === "" ||
        project.name.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        (project.category && project.category.toLowerCase().includes(q)) ||
        project.technologies.some((t) => t.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "Semua" ||
        project.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [projects, searchQuery, selectedCategory]);

  const handleOpenDetail = (project: WebProjectItem) => {
    setSelectedProject(project);
    setActiveView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCatalog = () => {
    setActiveView("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* 1. Header & Navigation */}
      <Navbar activeNav="aplikasi" />

      {/* 2. Main Content Body */}
      <main className="flex-1 w-full">
        {activeView === "catalog" ? (
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
            {/* Breadcrumb & Title */}
            <div className="space-y-4">
              <Breadcrumb
                items={[
                  { label: "Beranda", icon: Home, href: "/" },
                  { label: "Katalog Projek Web", isCurrent: true },
                ]}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-normal font-display py-0.5">
                    <span className="inline-block text-3d-bubble-main">Katalog Seluruh</span>{" "}
                    <ShimmerTitleText>Projek Web</ShimmerTitleText>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Jelajahi seluruh koleksi projek website interaktif, aplikasi web, dan dashboard modern.
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-start sm:self-auto">
                  {filteredProjects.length} projek web ditemukan
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
                  placeholder="Cari berdasarkan nama web, deskripsi, atau teknologi..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {WEB_PAGE_CATEGORIES.map((cat) => (
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

            {/* Web Projects Square Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-h-[360px]">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={`skel-web-${idx}`} className="w-full">
                    <WebProjectCardSkeleton delayMs={idx * 120} />
                  </div>
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="w-full">
                    <WebProjectCard
                      project={project}
                      onOpenDetail={handleOpenDetail}
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
          </div>
        ) : selectedProject ? (
          <WebProjectDetailView
            project={selectedProject}
            onBack={handleBackToCatalog}
            breadcrumbs={[
              {
                label: "Beranda",
                icon: Home,
                href: "/",
              },
              {
                label: "Katalog Projek Web",
                onClick: handleBackToCatalog,
              },
              {
                label: `Detail ${selectedProject.name}`,
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
    </div>
  );
}
