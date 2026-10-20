"use client";

import React, { useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutGrid, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";

interface FloatingBottomBarProps {
  activeNav: string;
  onNavClick?: (navId: string) => void;
}

/**
 * Bottom Bar Navigation khusus tampilan mobile/tablet kecil.
 * Dilengkapi animasi sliding background kenyal (elastic) dan efek samar-samar saat melintasi menu.
 */
export function FloatingBottomBar({
  activeNav,
  onNavClick,
}: FloatingBottomBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "aplikasi", label: "Aplikasi", icon: LayoutGrid },
    { id: "panduan", label: "Panduan", icon: BookOpen },
  ];

  const navRef = useRef<HTMLElement>(null);
  const activePillRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const prevNavRef = useRef<string | null>(null);
  const isInitialMount = useRef<boolean>(true);

  // Animasi Background Pill Kenyal & Samar-samar pada Mobile Bottom Bar
  useEffect(() => {
    const pillEl = activePillRef.current;
    const targetBtn = buttonRefs.current[activeNav];

    if (!pillEl || !targetBtn) return;

    // Gunakan offsetLeft/offsetTop dari parent relative agar posisi 100% presisi tanpa offset margin/padding ganda
    const targetX = targetBtn.offsetLeft;
    const targetY = targetBtn.offsetTop;
    const targetWidth = targetBtn.offsetWidth;
    const targetHeight = targetBtn.offsetHeight;

    const navIds = ["beranda", "aplikasi", "panduan"];
    const targetIndex = navIds.indexOf(activeNav);
    const prevNav = prevNavRef.current;
    const prevIndex = prevNav ? navIds.indexOf(prevNav) : -1;

    // Saat mount pertama kali atau posisi sama
    if (isInitialMount.current || prevIndex === -1 || prevIndex === targetIndex) {
      gsap.set(pillEl, {
        x: targetX,
        y: targetY,
        width: targetWidth,
        height: targetHeight,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        transformOrigin: "center center",
      });
      isInitialMount.current = false;
      prevNavRef.current = activeNav;
      return;
    }

    const distance = Math.abs(targetIndex - prevIndex);

    const currentX = gsap.getProperty(pillEl, "x") as number;
    const currentWidth = gsap.getProperty(pillEl, "width") as number;
    const startX = typeof currentX === "number" && !isNaN(currentX) ? currentX : targetX;
    const startWidth = typeof currentWidth === "number" && !isNaN(currentWidth) ? currentWidth : targetWidth;

    const startRight = startX + startWidth;
    const targetRight = targetX + targetWidth;
    const isMovingRight = targetX > startX;

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
          opacity: 0.3,
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

    prevNavRef.current = activeNav;
  }, [activeNav]);

  useEffect(() => {
    const handleResize = () => {
      const pillEl = activePillRef.current;
      const targetBtn = buttonRefs.current[activeNav];

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
  }, [activeNav]);

  const handleClick = (id: string) => {
    if (pathname !== "/") {
      if (id === "beranda") {
        router.push("/");
      } else if (id === "aplikasi") {
        router.push("/aplikasi");
      } else if (id === "panduan") {
        router.push("/#panduan-apk");
      }
      return;
    }
    if (onNavClick) onNavClick(id);
  };

  return (
    <aside
      aria-label="Navigasi Menu Mobile"
      className="md:hidden fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 select-none w-[calc(100vw-32px)] max-w-sm sm:max-w-md sm:w-auto pointer-events-auto"
    >
      <nav
        ref={navRef}
        className="relative flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/80 shadow-[0_16px_40px_-8px_rgba(15,23,42,0.2),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)] w-full"
      >
        {/* Animated Sliding Jelly Indicator Pill — Diposisikan top-0 left-0 agar translate akurat 100% */}
        <div
          ref={activePillRef}
          className="absolute top-0 left-0 pointer-events-none rounded-full bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_6px_rgba(37,99,235,0.35)] z-0 will-change-transform will-change-opacity"
          style={{ opacity: 0 }}
        />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              ref={(el) => {
                buttonRefs.current[item.id] = el;
              }}
              type="button"
              onClick={() => handleClick(item.id)}
              aria-label={item.label}
              className={cn(
                "relative z-10 flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 select-none active:scale-95",
                isActive
                  ? "text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground dark:hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
