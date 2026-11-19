"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingBottomBar } from "@/components/layout/FloatingBottomBar";
import { Home } from "lucide-react";
import { StoreHero } from "@/features/hero/StoreHero";
import { AppGridSection } from "@/features/catalog/AppGridSection";
import { SecurityTransparencySection } from "@/features/security/SecurityTransparencySection";
import { ApkGuideSection } from "@/features/guide/ApkGuideSection";
import type { AppDetailTab } from "@/features/detail/AppDetailView";
import { AppItem } from "@/types/store";
import { WebProjectItem } from "@/types/web-project";
import type { ApkSecurityReportDetail } from "@/types/security";
import { useCatalog } from "@/context/CatalogContext";

const AppDetailView = dynamic(
  () => import("@/features/detail/AppDetailView").then((m) => m.AppDetailView),
  { ssr: false }
);

const WebProjectDetailView = dynamic(
  () =>
    import("@/features/detail/WebProjectDetailView").then(
      (m) => m.WebProjectDetailView
    ),
  { ssr: false }
);

const DownloadModal = dynamic(
  () => import("@/features/download/DownloadModal").then((m) => m.DownloadModal),
  { ssr: false }
);

const InstallGuideModal = dynamic(
  () =>
    import("@/features/guide/InstallGuideModal").then(
      (m) => m.InstallGuideModal
    ),
  { ssr: false }
);

interface HomeCatalogClientProps {
  initialApps?: AppItem[];
  initialWebProjects?: WebProjectItem[];
  initialSecurityDetail?: ApkSecurityReportDetail | null;
  hasServerData?: boolean;
}

export function HomeCatalogClient({
  initialApps = [],
  initialWebProjects = [],
  initialSecurityDetail = null,
  hasServerData = false,
}: HomeCatalogClientProps) {
  const {
    apps: contextApps,
    webProjects: contextWebProjects,
    isLoading: isContextLoading,
    refreshCatalog,
  } = useCatalog();
  const appsList = contextApps.length > 0 ? contextApps : initialApps;
  const webProjectsList =
    contextWebProjects.length > 0 ? contextWebProjects : initialWebProjects;
  const isLoading = !hasServerData && appsList.length === 0 && isContextLoading;

  // Jika SSR sempat kosong karena gangguan DB sementara, segera ambil katalog langsung di client
  useEffect(() => {
    if (!hasServerData || initialApps.length === 0 || initialWebProjects.length === 0) {
      void refreshCatalog();
    }
  }, [hasServerData, initialApps.length, initialWebProjects.length, refreshCatalog]);

  const [activeView, setActiveView] = useState<"catalog" | "detail" | "detail-web">("catalog");
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(
    () => initialApps[0] ?? null
  );
  const [detailInitialTab, setDetailInitialTab] = useState<AppDetailTab>("versi");
  const [selectedWebProject, setSelectedWebProject] = useState<WebProjectItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sinkronkan parameter pencarian ?q= dari URL (mendukung Google Sitelinks SearchAction)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q")?.trim();
    if (q) {
      setSearchQuery(q);
    }
  }, []);
  const [downloadModalApp, setDownloadModalApp] = useState<AppItem | null>(null);
  const [guideModalApp, setGuideModalApp] = useState<AppItem | null>(null);
  const [activeNav, setActiveNav] = useState<string>("beranda");
  const isManualScrollLockRef = useRef<boolean>(false);
  const scrollLockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sinkronkan selectedApp dengan data terbaru di appsList
  useEffect(() => {
    if (appsList.length > 0) {
      if (!selectedApp) {
        setSelectedApp(appsList[0]);
      } else {
        const latest = appsList.find((a) => a.id === selectedApp.id);
        if (
          latest &&
          (latest.version !== selectedApp.version ||
            latest.apkUrl !== selectedApp.apkUrl ||
            latest.fileSize !== selectedApp.fileSize ||
            latest.lastUpdated !== selectedApp.lastUpdated ||
            latest.securityScan?.status !== selectedApp.securityScan?.status ||
            latest.securityScan?.sha256 !== selectedApp.securityScan?.sha256)
        ) {
          setSelectedApp(latest);
        }
      }
    }
  }, [appsList, selectedApp]);

  // Filter apps based on search query
  const filteredApps = useMemo(() => {
    if (searchQuery.trim() === "") {
      return appsList;
    }
    const q = searchQuery.toLowerCase();
    return appsList.filter((app) => {
      return (
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, appsList]);

  // Filter web projects based on search query
  const filteredWebProjects = useMemo(() => {
    if (searchQuery.trim() === "") {
      return webProjectsList;
    }
    const q = searchQuery.toLowerCase();
    return webProjectsList.filter((proj) => {
      return (
        proj.name.toLowerCase().includes(q) ||
        proj.description.toLowerCase().includes(q) ||
        (proj.category && proj.category.toLowerCase().includes(q)) ||
        proj.technologies.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, webProjectsList]);

  // Scroll Spy untuk mengaktifkan menu navbar & bottom navbar secara otomatis saat scrolling
  useEffect(() => {
    if (activeView !== "catalog") {
      setActiveNav("aplikasi");
      return;
    }

    let rafId: number | null = null;

    const syncActiveNavFromScroll = () => {
      if (isManualScrollLockRef.current) return;

      const scrollY =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      const windowHeight = window.innerHeight;
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );

      // Hanya paksa "panduan" jika pengguna sudah mencapai paling bawah halaman
      if (scrollY > 50 && scrollY + windowHeight >= docHeight - 16) {
        setActiveNav((prev) => (prev === "panduan" ? prev : "panduan"));
        return;
      }

      // Garis acuan pembacaan di area atas viewport (di bawah navbar 64px)
      const triggerY = Math.min(220, Math.round(windowHeight * 0.3));
      const orderedSections = [
        { id: "beranda", element: document.getElementById("beranda") },
        { id: "aplikasi", element: document.getElementById("katalog") },
        { id: "keamanan", element: document.getElementById("keamanan") },
        { id: "panduan", element: document.getElementById("panduan-apk") },
      ];

      let nextActive = "beranda";
      for (const section of orderedSections) {
        if (!section.element) continue;
        const rect = section.element.getBoundingClientRect();
        if (rect.top <= triggerY) {
          nextActive = section.id;
        }
      }

      setActiveNav((prev) => (prev === nextActive ? prev : nextActive));
    };

    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        syncActiveNavFromScroll();
      });
    };

    // Jika pengguna langsung menggulir manual setelah klik menu, segera lepas kunci scroll
    const releaseManualLock = () => {
      if (isManualScrollLockRef.current) {
        isManualScrollLockRef.current = false;
        if (scrollLockTimerRef.current) {
          clearTimeout(scrollLockTimerRef.current);
          scrollLockTimerRef.current = null;
        }
      }
      scheduleSync();
    };

    window.addEventListener("scroll", scheduleSync, { passive: true });
    document.addEventListener("scroll", scheduleSync, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", scheduleSync, { passive: true });
    window.addEventListener("wheel", releaseManualLock, { passive: true });
    window.addEventListener("touchstart", releaseManualLock, { passive: true });

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(scheduleSync, {
        threshold: [0, 0.1, 0.25, 0.5],
      });
      ["beranda", "katalog", "keamanan", "panduan-apk"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer?.observe(el);
      });
    }

    syncActiveNavFromScroll();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleSync);
      document.removeEventListener("scroll", scheduleSync, { capture: true });
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("wheel", releaseManualLock);
      window.removeEventListener("touchstart", releaseManualLock);
      observer?.disconnect();
    };
  }, [activeView, isLoading, appsList.length]);

  const handleOpenDetail = (app: AppItem, initialTab: AppDetailTab = "versi") => {
    setSelectedApp(app);
    setDetailInitialTab(initialTab);
    setActiveView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenWebDetail = (project: WebProjectItem) => {
    setSelectedWebProject(project);
    setActiveView("detail-web");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCatalog = () => {
    setActiveView("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = (app: AppItem) => {
    // Ambil data versi terbaru dari appsList agar modal selalu memakai versi mutakhir
    const latestApp = appsList.find((a) => a.id === app.id) || app;
    setDownloadModalApp(latestApp);
    setGuideModalApp(latestApp);
  };

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
    isManualScrollLockRef.current = true;
    if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current);
    scrollLockTimerRef.current = setTimeout(() => {
      isManualScrollLockRef.current = false;
    }, 850);

    if (navId === "beranda") {
      if (activeView !== "catalog") {
        setActiveView("catalog");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    const sectionIdByNav: Record<string, string> = {
      aplikasi: "katalog",
      keamanan: "keamanan",
      panduan: "panduan-apk",
    };

    const targetId = sectionIdByNav[navId];
    if (!targetId) return;

    const scrollToTargetSection = () => {
      const element = document.getElementById(targetId);
      if (element) {
        const navbarHeight = 64;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });
      }
    };

    if (activeView !== "catalog") {
      setActiveView("catalog");
      setTimeout(scrollToTargetSection, 50);
    } else {
      scrollToTargetSection();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* 1. Header & Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeNav={activeNav}
        onNavClick={handleNavClick}
      />

      {/* 2. Main Content Body */}
      <main className="flex-1">
        {activeView === "catalog" ? (
          <>
            {/* Store Hero Section dengan Carousel Tampilan Handphone */}
            <StoreHero
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={() => handleNavClick("aplikasi")}
              apps={filteredApps}
              totalAppsCount={appsList.length}
              totalWebProjectsCount={webProjectsList.length}
              isLoading={isLoading}
              onSelectApp={handleOpenDetail}
              onDownloadApp={handleDownload}
              onExploreCatalog={() => handleNavClick("aplikasi")}
              onOpenGuide={() => handleNavClick("panduan")}
            />

            {/* Catalog List Section with Dual Filters (Aplikasi & Web) - Limit 3 di Beranda */}
            <AppGridSection
              apps={filteredApps}
              webProjects={filteredWebProjects}
              isLoading={isLoading}
              onOpenDetail={(app) => handleOpenDetail(app, "versi")}
              onOpenWebDetail={handleOpenWebDetail}
              onDownload={handleDownload}
              onResetSearch={() => setSearchQuery("")}
              limit={3}
            />

            {/* Transparansi Status Cek Virus Aplikasi di Halaman Utama */}
            <SecurityTransparencySection
              apps={appsList}
              isLoading={isLoading}
              initialDetail={initialSecurityDetail}
              onOpenSecurityDetail={(app) => handleOpenDetail(app, "keamanan")}
              onOpenAppDetail={(app) => handleOpenDetail(app, "versi")}
            />

            {/* Panduan Pasang APK Section */}
            <ApkGuideSection
              onOpenGuideModal={() => setGuideModalApp(selectedApp || appsList[0] || null)}
            />
          </>
        ) : activeView === "detail" && selectedApp ? (
          /* App Detail View */
          <AppDetailView
            app={selectedApp}
            onBack={handleBackToCatalog}
            onDownload={handleDownload}
            initialTab={detailInitialTab}
            breadcrumbs={[
              {
                label: "Beranda",
                icon: Home,
                onClick: handleBackToCatalog,
              },
              {
                label: `Detail ${selectedApp.name}`,
                isCurrent: true,
              },
            ]}
          />
        ) : activeView === "detail-web" && selectedWebProject ? (
          /* Web Project Detail View */
          <WebProjectDetailView
            project={selectedWebProject}
            onBack={handleBackToCatalog}
            breadcrumbs={[
              {
                label: "Beranda",
                icon: Home,
                onClick: handleBackToCatalog,
              },
              {
                label: `Detail ${selectedWebProject.name}`,
                isCurrent: true,
              },
            ]}
          />
        ) : null}
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* Floating Bottom Bar Navigation (khusus tampilan mobile pada beranda katalog, disembunyikan pada tampilan detail) */}
      {activeView === "catalog" && (
        <FloatingBottomBar
          activeNav={activeNav}
          onNavClick={handleNavClick}
        />
      )}

      {/* 4. Download Multi-Platform Modal */}
      <DownloadModal
        app={downloadModalApp}
        isOpen={downloadModalApp !== null}
        onClose={() => setDownloadModalApp(null)}
        onOpenGuide={(app) => setGuideModalApp(app)}
      />

      {/* 5. Large Canvas APK Installation Guide Modal */}
      <InstallGuideModal
        app={guideModalApp}
        isOpen={guideModalApp !== null}
        onClose={() => setGuideModalApp(null)}
      />
    </div>
  );
}
