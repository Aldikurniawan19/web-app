"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { AppItem } from "@/types/store";
import { WebProjectItem } from "@/types/web-project";

export const APPS_SESSION_CACHE_KEY = "allprojects_apps_session_v2";
export const WEB_PROJECTS_SESSION_CACHE_KEY = "allprojects_web_session_v2";

const SSR_PUBLIC_PATHS = new Set(["/", "/aplikasi", "/projek-web"]);

async function fetchJsonWithRetry(
  url: string,
  fetchInit?: RequestInit,
  maxAttempts = 2
): Promise<Response | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, fetchInit);
      if (res.ok) return res;
      if (res.status < 500 || attempt === maxAttempts) return res;
    } catch {
      if (attempt === maxAttempts) return null;
    }
    await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
  }
  return null;
}

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
  const inFlightPromiseRef = useRef<Promise<void> | null>(null);
  const hasLoadedFromNetworkRef = useRef<boolean>(false);

  // Fungsi untuk memuat data dari cache sesi window atau dari API dengan retry otomatis
  const loadCatalog = useCallback(async (force = false) => {
    if (!force && inFlightPromiseRef.current) {
      return inFlightPromiseRef.current;
    }

    // 1. Coba baca dari sessionStorage window HANYA untuk tampilan awal instan (tanpa flicker loading)
    if (!force && typeof window !== "undefined") {
      try {
        const cachedApps = sessionStorage.getItem(APPS_SESSION_CACHE_KEY);
        if (cachedApps) {
          const parsed = JSON.parse(cachedApps);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setApps(parsed);
          }
        }

        const cachedWeb = sessionStorage.getItem(WEB_PROJECTS_SESSION_CACHE_KEY);
        if (cachedWeb) {
          const parsed = JSON.parse(cachedWeb);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWebProjects(parsed);
          }
        }
      } catch {
        // Abaikan error parsing cache
      }
    }

    // 2. Fetch data terbaru dari server (Stale-While-Revalidate) dengan retry saat jaringan seluler tidak stabil
    const task = (async () => {
      try {
        const fetchInit: RequestInit | undefined = force
          ? { cache: "no-store" }
          : undefined;
        const [appsRes, webRes] = await Promise.all([
          fetchJsonWithRetry("/api/apps", fetchInit),
          fetchJsonWithRetry("/api/web-projects", fetchInit),
        ]);

        if (appsRes && appsRes.ok) {
          const json = await appsRes.json();
          if (json.success && Array.isArray(json.data)) {
            setApps(json.data);
            if (typeof window !== "undefined") {
              try {
                sessionStorage.setItem(
                  APPS_SESSION_CACHE_KEY,
                  JSON.stringify(json.data)
                );
              } catch {}
            }
          }
        }

        if (webRes && webRes.ok) {
          const webJson = await webRes.json();
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
        hasLoadedFromNetworkRef.current = true;
      } catch (err) {
        console.error("Gagal memperbarui katalog:", err);
      } finally {
        setIsLoading(false);
        inFlightPromiseRef.current = null;
      }
    })();

    inFlightPromiseRef.current = task;
    return task;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Halaman publik SSR/ISR (/, /aplikasi, /projek-web) sudah membawa data segar dari server.
    // Tunda revalidasi latar belakang sampai pengguna berinteraksi atau jaringan senggang
    // agar tidak mengganggu bandwidth gambar LCP dan network-quiet Lighthouse mobile.
    if (SSR_PUBLIC_PATHS.has(window.location.pathname)) {
      let triggered = false;
      const triggerOnce = () => {
        if (triggered || hasLoadedFromNetworkRef.current) return;
        triggered = true;
        cleanup();
        void loadCatalog();
      };

      const idleTimer = setTimeout(triggerOnce, 12_000);
      const events: Array<keyof WindowEventMap> = [
        "pointerdown",
        "touchstart",
        "keydown",
        "scroll",
      ];

      const cleanup = () => {
        clearTimeout(idleTimer);
        for (const evt of events) {
          window.removeEventListener(evt, triggerOnce);
        }
      };

      for (const evt of events) {
        window.addEventListener(evt, triggerOnce, { passive: true, once: true });
      }

      return cleanup;
    }

    void loadCatalog();
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
