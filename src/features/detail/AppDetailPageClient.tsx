"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  AppDetailView,
  type AppDetailTab,
} from "@/features/detail/AppDetailView";
import { useCatalog } from "@/context/CatalogContext";
import type { AppItem } from "@/types/store";

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

const VALID_DETAIL_TABS = new Set<AppDetailTab>([
  "versi",
  "keamanan",
  "informasi",
  "changelog",
]);

interface AppDetailPageClientProps {
  initialApp: AppItem;
}

/**
 * Wrapper halaman detail aplikasi khusus (/aplikasi/[id]) yang dirender via SSR/ISR
 * agar setiap aplikasi memiliki URL kanonis, metadata SEO, dan tombol Back browser alami.
 */
export function AppDetailPageClient({ initialApp }: AppDetailPageClientProps) {
  const router = useRouter();
  const { apps: contextApps } = useCatalog();
  const [initialTab, setInitialTab] = useState<AppDetailTab>("versi");
  const [downloadModalApp, setDownloadModalApp] = useState<AppItem | null>(null);
  const [guideModalApp, setGuideModalApp] = useState<AppItem | null>(null);

  const matchedFromContext = contextApps.find((item) => item.id === initialApp.id);
  const app = matchedFromContext ?? initialApp;

  // Baca parameter ?tab=keamanan / ?tab=informasi dari URL di client agar halaman tetap static/ISR
  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawTab = new URLSearchParams(window.location.search).get("tab");
    if (rawTab && VALID_DETAIL_TABS.has(rawTab as AppDetailTab)) {
      setInitialTab(rawTab as AppDetailTab);
    }
  }, []);

  const handleBackToCatalog = () => {
    router.push("/aplikasi");
  };

  const handleDownload = (targetApp: AppItem) => {
    setDownloadModalApp(targetApp);
    setGuideModalApp(targetApp);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar activeNav="aplikasi" />

      <main className="flex-1 w-full">
        <AppDetailView
          app={app}
          onBack={handleBackToCatalog}
          onDownload={handleDownload}
          initialTab={initialTab}
          breadcrumbs={[
            {
              label: "Beranda",
              icon: Home,
              href: "/",
            },
            {
              label: "Katalog Aplikasi",
              href: "/aplikasi",
            },
            {
              label: `Detail ${app.name}`,
              isCurrent: true,
            },
          ]}
        />
      </main>

      <Footer />

      <DownloadModal
        app={downloadModalApp}
        isOpen={downloadModalApp !== null}
        onClose={() => setDownloadModalApp(null)}
        onOpenGuide={(targetApp) => setGuideModalApp(targetApp)}
      />

      <InstallGuideModal
        app={guideModalApp}
        isOpen={guideModalApp !== null}
        onClose={() => setGuideModalApp(null)}
      />
    </div>
  );
}
