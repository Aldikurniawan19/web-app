"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { registerLenisInstance, smoothScrollTo } from "@/lib/smooth-scroll";

const STICKY_NAVBAR_OFFSET_PX = -64;

/**
 * Provider Smooth Scroll berbasis Lenis untuk halaman publik alllprojects.
 * - Aktif pada seluruh halaman publik, dinonaktifkan di portal /admin dan saat prefers-reduced-motion aktif.
 * - Menjaga physics sentuhan asli pada perangkat seluler (syncTouch: false) agar ringan dan responsif.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const previousPathnameRef = useRef<string | null>(null);
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (typeof window === "undefined" || isAdminRoute) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      syncTouch: false,
      touchMultiplier: 1,
      autoResize: true,
      stopInertiaOnNavigate: true,
      anchors: {
        offset: STICKY_NAVBAR_OFFSET_PX,
        duration: 1.05,
      },
    });

    lenisRef.current = lenis;
    registerLenisInstance(lenis);

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        lenis.destroy();
        lenisRef.current = null;
        registerLenisInstance(null);
      }
    };

    mediaQuery.addEventListener("change", handleReducedMotionChange);

    return () => {
      mediaQuery.removeEventListener("change", handleReducedMotionChange);
      lenis.destroy();
      lenisRef.current = null;
      registerLenisInstance(null);
    };
  }, [isAdminRoute]);

  // Sinkronkan dimensi Lenis saat berpindah halaman atau menuju anchor hash (#keamanan, #panduan-apk)
  useEffect(() => {
    if (typeof window === "undefined" || isAdminRoute) return;

    const isRouteChange =
      previousPathnameRef.current !== null &&
      previousPathnameRef.current !== pathname;
    previousPathnameRef.current = pathname;

    const hash = window.location.hash;
    if (hash) {
      const targetEl = document.querySelector<HTMLElement>(hash);
      if (targetEl) {
        const timer = setTimeout(() => {
          smoothScrollTo(targetEl, {
            offset: STICKY_NAVBAR_OFFSET_PX,
            duration: 1.05,
          });
        }, 60);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (isRouteChange && lenisRef.current) {
      lenisRef.current.resize();
    }
  }, [pathname, isAdminRoute]);

  return <>{children}</>;
}
