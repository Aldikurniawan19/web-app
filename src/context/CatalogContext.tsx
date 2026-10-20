"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { AppItem } from "@/types/store";
import { WebProjectItem } from "@/types/web-project";

export const APPS_SESSION_CACHE_KEY = "allprojects_apps_session";
export const WEB_PROJECTS_SESSION_CACHE_KEY = "allprojects_web_session";

/**
 * Helper untuk membersihkan cache sesi sementara di window saat admin mengubah data.
 */
export function clearCatalogSessionCache() {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(APPS_SESSION_CACHE_KEY);
      sessionStorage.removeItem(WEB_PROJECTS_SESSION_CACHE_KEY);
    } catch {
      // Abaikan jika browser membatasi akses storage
    }
  }
}

interface CatalogContextType {
  apps: AppItem[];
  webProjects: WebProjectItem[];
  isLoading: boolean;
  refreshCatalog: (force?: boolean) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [webProjects, setWebProjects] = useState<WebProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fungsi untuk memuat data dari cache sesi window atau dari API
  const loadCatalog = useCallback(async (force = false) => {
    let hasCachedApps = false;
    let hasCachedWeb = false;

    // 1. Coba baca dari sessionStorage window jika tidak dipaksa refresh
    if (!force && typeof window !== "undefined") {
      try {
        const cachedApps = sessionStorage.getItem(APPS_SESSION_CACHE_KEY);
        if (cachedApps) {
          const parsed = JSON.parse(cachedApps);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setApps(parsed);
            hasCachedApps = true;
          }
        }

        const cachedWeb = sessionStorage.getItem(WEB_PROJECTS_SESSION_CACHE_KEY);
        if (cachedWeb) {
          const parsed = JSON.parse(cachedWeb);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWebProjects(parsed);
            hasCachedWeb = true;
          }
        }
      } catch {
        // Abaikan error parsing cache
      }
    }

    // Jika kedua data sudah ada di sesi window saat ini, langsung gunakan tanpa fetch ulang
    if (hasCachedApps && hasCachedWeb) {
      setIsLoading(false);
      return;
    }

    // 2. Fetch data dari server jika belum tersimpan di sesi window
    try {
      setIsLoading(true);

      const [appsResult, webResult] = await Promise.allSettled([
        !hasCachedApps ? fetch("/api/apps") : Promise.resolve(null),
        !hasCachedWeb ? fetch("/api/web-projects") : Promise.resolve(null),
      ]);

      if (appsResult.status === "fulfilled" && appsResult.value && appsResult.value.ok) {
        const json = await appsResult.value.json();
        if (json.success && Array.isArray(json.data)) {
          setApps(json.data);
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(APPS_SESSION_CACHE_KEY, JSON.stringify(json.data));
            } catch {}
          }
        }
      }

      if (webResult.status === "fulfilled" && webResult.value && webResult.value.ok) {
        const webJson = await webResult.value.json();
        if (webJson.success && Array.isArray(webJson.data)) {
          setWebProjects(webJson.data);
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(
                WEB_PROJECTS_SESSION_CACHE_KEY,
                JSON.stringify(webJson.data)
              );
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error("Gagal memuat katalog ke sesi window:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const refreshCatalog = useCallback(
    async (force = false) => {
      if (force) {
        clearCatalogSessionCache();
      }
      await loadCatalog(force);
    },
    [loadCatalog]
  );

  return (
    <CatalogContext.Provider value={{ apps, webProjects, isLoading, refreshCatalog }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog wajib digunakan di dalam CatalogProvider.");
  }
  return context;
}
