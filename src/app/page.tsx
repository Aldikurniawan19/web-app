"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StoreHero } from "@/features/hero/StoreHero";
import { AppGridSection } from "@/features/catalog/AppGridSection";
import { ApkGuideSection } from "@/features/guide/ApkGuideSection";
import { AppDetailView } from "@/features/detail/AppDetailView";
import { DownloadModal } from "@/features/download/DownloadModal";
import { InstallGuideModal } from "@/features/guide/InstallGuideModal";
import { APP_STORE_ITEMS } from "@/constants/app-store-data";
import { AppItem } from "@/types/store";

export default function AppHubPage() {
  const [appsList, setAppsList] = useState<AppItem[]>(APP_STORE_ITEMS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<"catalog" | "detail">("catalog");
  const [selectedApp, setSelectedApp] = useState<AppItem>(APP_STORE_ITEMS[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [downloadModalApp, setDownloadModalApp] = useState<AppItem | null>(null);
  const [guideModalApp, setGuideModalApp] = useState<AppItem | null>(null);
  const [activeNav, setActiveNav] = useState<string>("beranda");
  const isManualScrollLockRef = useRef<boolean>(false);
  const scrollLockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch updated apps list on mount with loading skeleton transition
  useEffect(() => {
    let isMounted = true;
    const fetchLatestApps = async () => {
      try {
        const res = await fetch("/api/apps");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAppsList(json.data);
          }
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data aplikasi:", err);
      } finally {
        if (isMounted) {
          // Berikan jeda halus agar skeleton terlihat mulus
          setTimeout(() => {
            if (isMounted) setIsLoading(false);
          }, 350);
        }
      }
    };
    fetchLatestApps();

    return () => {
      isMounted = false;
    };
  }, []);

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

  // Scroll Spy untuk mengaktifkan menu navbar & bottom navbar secara otomatis saat scrolling
  useEffect(() => {
    if (activeView !== "catalog") {
      setActiveNav("aplikasi");
      return;
    }

    const handleScroll = () => {
      // Abaikan event scroll saat animasi perpindahan halus sedang berlangsung (mencegah navbar melompat bolak-balik)
      if (isManualScrollLockRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Jika user sudah berada di ujung bawah halaman (Panduan / Footer)
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
      if (activeView !== "catalog") {
        setActiveView("catalog");
        setTimeout(() => {
          const element = document.getElementById("katalog");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 50);
      } else {
        const element = document.getElementById("katalog");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else if (navId === "panduan") {
      if (activeView !== "catalog") {
        setActiveView("catalog");
        setTimeout(() => {
          const element = document.getElementById("panduan-apk");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 50);
      } else {
        const element = document.getElementById("panduan-apk");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
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

            {/* Catalog List Section without Category Filters */}
            <AppGridSection
              apps={filteredApps}
              isLoading={isLoading}
              onOpenDetail={handleOpenDetail}
              onDownload={handleDownload}
              onResetSearch={() => setSearchQuery("")}
            />

            {/* Panduan Pasang APK Section */}
            <ApkGuideSection
              onOpenGuideModal={() => setGuideModalApp(selectedApp || appsList[0])}
            />
          </>
        ) : (
          /* App Detail View (persis halaman detail Notely) */
          <AppDetailView
            app={selectedApp}
            onBack={handleBackToCatalog}
            onDownload={handleDownload}
          />
        )}
      </main>

      {/* 3. Footer */}
      <Footer />

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
