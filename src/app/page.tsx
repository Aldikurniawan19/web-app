"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingBottomBar } from "@/components/layout/FloatingBottomBar";
import { Home } from "lucide-react";
import { StoreHero } from "@/features/hero/StoreHero";
import { AppGridSection } from "@/features/catalog/AppGridSection";
import { ApkGuideSection } from "@/features/guide/ApkGuideSection";
import { AppDetailView } from "@/features/detail/AppDetailView";
import { WebProjectDetailView } from "@/features/detail/WebProjectDetailView";
import { DownloadModal } from "@/features/download/DownloadModal";
import { InstallGuideModal } from "@/features/guide/InstallGuideModal";
import { AppItem } from "@/types/store";
import { WebProjectItem } from "@/types/web-project";
import { useCatalog } from "@/context/CatalogContext";

export default function AppHubPage() {
  const { apps: appsList, webProjects: webProjectsList, isLoading } = useCatalog();
  const [activeView, setActiveView] = useState<"catalog" | "detail" | "detail-web">("catalog");
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [selectedWebProject, setSelectedWebProject] = useState<WebProjectItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [downloadModalApp, setDownloadModalApp] = useState<AppItem | null>(null);
  const [guideModalApp, setGuideModalApp] = useState<AppItem | null>(null);
  const [activeNav, setActiveNav] = useState<string>("beranda");
  const isManualScrollLockRef = useRef<boolean>(false);
  const scrollLockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set default selectedApp saat appsList tersedia
  useEffect(() => {
    if (appsList.length > 0 && !selectedApp) {
      setSelectedApp(appsList[0]);
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

    const handleScroll = () => {
      if (isManualScrollLockRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= docHeight - 120) {
        setActiveNav("panduan");
        return;
      }

      const katalogEl = document.getElementById("katalog");
      const panduanEl = document.getElementById("panduan-apk");

      if (panduanEl) {
        const panduanTop = panduanEl.offsetTop - 200;
        if (scrollY >= panduanTop) {
          setActiveNav("panduan");
          return;
        }
      }

      if (katalogEl) {
        const katalogTop = katalogEl.offsetTop - 200;
        if (scrollY >= katalogTop) {
          setActiveNav("aplikasi");
          return;
        }
      }

      setActiveNav("beranda");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeView]);

  const handleOpenDetail = (app: AppItem) => {
    setSelectedApp(app);
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
    setDownloadModalApp(app);
    setGuideModalApp(app);
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
    } else if (navId === "aplikasi") {
      const scrollToKatalog = () => {
        const element = document.getElementById("katalog");
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
        setTimeout(scrollToKatalog, 50);
      } else {
        scrollToKatalog();
      }
    } else if (navId === "panduan") {
      const scrollToPanduan = () => {
        const element = document.getElementById("panduan-apk");
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
        setTimeout(scrollToPanduan, 50);
      } else {
        scrollToPanduan();
      }
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
            {/* Store Hero Section with Search & Laptop Illustration */}
            <StoreHero
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={() => {
                const element = document.getElementById("katalog");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* Catalog List Section with Dual Filters (Aplikasi & Web) - Limit 3 di Beranda */}
            <AppGridSection
              apps={filteredApps}
              webProjects={filteredWebProjects}
              isLoading={isLoading}
              onOpenDetail={handleOpenDetail}
              onOpenWebDetail={handleOpenWebDetail}
              onDownload={handleDownload}
              onResetSearch={() => setSearchQuery("")}
              limit={3}
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
