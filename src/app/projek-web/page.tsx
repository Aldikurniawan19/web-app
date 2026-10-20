"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WebProjectCard } from "@/features/catalog/WebProjectCard";
import { WebProjectCardSkeleton } from "@/features/catalog/WebProjectCardSkeleton";
import { WebProjectDetailView } from "@/features/detail/WebProjectDetailView";
import { WebProjectItem } from "@/types/web-project";
import { ShimmerTitleText } from "@/components/ui/ShimmerTitleText";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Search, Globe, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/context/CatalogContext";
import gsap from "gsap";

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

  const catPillRef = useRef<HTMLDivElement>(null);
  const catBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const prevCatRef = useRef<string | null>(null);
  const isInitialCatMount = useRef<boolean>(true);

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

  // Animasi Background Pill Kenyal untuk Filter Kategori Web (melar dari arah navigasi)
  useEffect(() => {
    const pillEl = catPillRef.current;
    const targetBtn = catBtnRefs.current[selectedCategory];

    if (!pillEl || !targetBtn) return;

    const targetX = targetBtn.offsetLeft;
    const targetY = targetBtn.offsetTop;
    const targetWidth = targetBtn.offsetWidth;
    const targetHeight = targetBtn.offsetHeight;

    const catIndex = WEB_PAGE_CATEGORIES.indexOf(selectedCategory);
    const prevCat = prevCatRef.current;
    const prevIndex = prevCat ? WEB_PAGE_CATEGORIES.indexOf(prevCat) : -1;

    if (isInitialCatMount.current || prevIndex === -1 || prevIndex === catIndex) {
      gsap.set(pillEl, {
        x: targetX,
        y: targetY,
        width: targetWidth,
        height: targetHeight,
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        transformOrigin: "center center",
      });
      isInitialCatMount.current = false;
      prevCatRef.current = selectedCategory;
      return;
    }

    const currentX = gsap.getProperty(pillEl, "x") as number;
    const currentWidth = gsap.getProperty(pillEl, "width") as number;
    const startX = typeof currentX === "number" && !isNaN(currentX) ? currentX : targetX;
    const startWidth = typeof currentWidth === "number" && !isNaN(currentWidth) ? currentWidth : targetWidth;

    const startRight = startX + startWidth;
    const targetRight = targetX + targetWidth;
    const isMovingRight = targetX > startX;
    const distance = Math.abs(catIndex - prevIndex);

    gsap.killTweensOf(pillEl);

    // Animasi pergerakan fluida independen: ujung depan melesat lebih dulu, ujung ekor menyusul
    // sehingga pill benar-benar "molor" dan meluncur ke arah tujuan (bukan membesar di tempat)
    const state = {
      left: startX,
      right: startRight,
    };

    const updatePill = () => {
      const curWidth = Math.max(state.right - state.left, 24);
      gsap.set(pillEl, {
        x: state.left,
        width: curWidth,
        y: targetY,
        height: targetHeight,
      });
    };

    const tl = gsap.timeline();

    if (isMovingRight) {
      // BERGERAK KE KANAN:
      // Ujung kanan (depan) melesat duluan ke target
      tl.to(
        state,
        {
          right: targetRight,
          duration: 0.52,
          ease: "power2.out",
          onUpdate: updatePill,
        },
        0
      );

      // Ujung kiri (ekor) menyusul dengan jeda sedikit (molor ke arah kanan!)
      tl.to(
        state,
        {
          left: targetX,
          duration: 0.62,
          ease: "elastic.out(1.05, 0.72)",
          onUpdate: updatePill,
        },
        0.08
      );
    } else {
      // BERGERAK KE KIRI:
      // Ujung kiri (depan) melesat duluan ke target
      tl.to(
        state,
        {
          left: targetX,
          duration: 0.52,
          ease: "power2.out",
          onUpdate: updatePill,
        },
        0
      );

      // Ujung kanan (ekor) menyusul dengan jeda sedikit (molor ke arah kiri!)
      tl.to(
        state,
        {
          right: targetRight,
          duration: 0.62,
          ease: "elastic.out(1.05, 0.72)",
          onUpdate: updatePill,
        },
        0.08
      );
    }

    // Efek ketebalan fluida air: menipis saat melar memanjang, lalu membal kenyal di tujuan
    tl.to(
      pillEl,
      {
        scaleY: 0.88,
        duration: 0.22,
        ease: "power1.out",
        transformOrigin: "center center",
      },
      0
    );
    tl.to(
      pillEl,
      {
        scaleY: 1.05,
        duration: 0.26,
        ease: "power1.inOut",
        transformOrigin: "center center",
      },
      0.22
    );
    tl.to(
      pillEl,
      {
        scaleY: 1,
        duration: 0.3,
        ease: "elastic.out(1.05, 0.65)",
        transformOrigin: "center center",
      },
      0.48
    );

    if (distance > 1) {
      // Efek air menipis samar-samar saat melompati menu di antaranya
      tl.to(
        pillEl,
        {
          opacity: 0.32,
          duration: 0.26,
          ease: "power2.in",
        },
        0
      );
      tl.to(
        pillEl,
        {
          opacity: 1,
          duration: 0.42,
          ease: "power2.out",
        },
        0.24
      );
    }

    prevCatRef.current = selectedCategory;
  }, [selectedCategory]);

  useEffect(() => {
    const handleResize = () => {
      const pillEl = catPillRef.current;
      const targetBtn = catBtnRefs.current[selectedCategory];

      if (!pillEl || !targetBtn) return;

      gsap.set(pillEl, {
        x: targetBtn.offsetLeft,
        y: targetBtn.offsetTop,
        width: targetBtn.offsetWidth,
        height: targetBtn.offsetHeight,
        transformOrigin: "center center",
      });
    };

    window.addEventListener("resize", handleResize);
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(handleResize);
    }
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedCategory]);

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

              {/* Category Pills dengan background sliding kenyal dinamis */}
              <div className="relative flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {/* Sliding Elastic Pill Indicator — Diposisikan top-0 left-0 agar presisi */}
                <div
                  ref={catPillRef}
                  className="absolute top-0 left-0 pointer-events-none rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.25)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_0_#1e3a8a] z-0 will-change-transform will-change-opacity"
                  style={{ opacity: 0 }}
                />

                {WEB_PAGE_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      ref={(el) => {
                        catBtnRefs.current[cat] = el;
                      }}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "relative z-10 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors select-none",
                        isActive
                          ? "text-white"
                          : "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
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

    </div>
  );
}
