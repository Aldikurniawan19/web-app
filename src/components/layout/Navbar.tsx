"use client";

import React, { useRef, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ShimmerTitleText } from "@/components/ui/ShimmerTitleText";
import gsap from "gsap";

/**
 * Official GitHub Mark (Octocat) SVG Silhouette
 */
function GithubBrandIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
      />
    </svg>
  );
}

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  activeNav?: string;
  onNavClick?: (nav: string) => void;
}

export function Navbar({
  activeNav = "aplikasi",
  onNavClick,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "beranda", label: "Beranda" },
    { id: "aplikasi", label: "Aplikasi" },
    { id: "panduan", label: "Panduan" },
  ];

  const navRef = useRef<HTMLElement>(null);
  const activePillRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const prevNavRef = useRef<string | null>(null);
  const isInitialMount = useRef<boolean>(true);

  // Animasi Background Pill Kenyal (Elastic) & Samar-Samar saat Melintas Banyak Menu
  useEffect(() => {
    const pillEl = activePillRef.current;
    const targetBtn = buttonRefs.current[activeNav];

    if (!pillEl || !targetBtn) return;

    // Gunakan offsetLeft/offsetTop karena navRef berposisi relative sehingga presisi 100%
    const targetX = targetBtn.offsetLeft;
    const targetY = targetBtn.offsetTop;
    const targetWidth = targetBtn.offsetWidth;
    const targetHeight = targetBtn.offsetHeight;

    const navIds = ["beranda", "aplikasi", "panduan"];
    const targetIndex = navIds.indexOf(activeNav);
    const prevNav = prevNavRef.current;
    const prevIndex = prevNav ? navIds.indexOf(prevNav) : -1;

    // Saat pertama kali dimuat (initial mount) atau belum ada perpindahan
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
    const direction = targetIndex > prevIndex ? 1 : -1; // 1 = ke kanan, -1 = ke kiri

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

  // Sinkronisasi posisi jika ukuran layar berubah atau font dimuat
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
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        transformOrigin: "center center",
      });
    };

    window.addEventListener("resize", handleResize);
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(handleResize);
    }
    return () => window.removeEventListener("resize", handleResize);
  }, [activeNav]);

  const handleItemClick = (id: string) => {
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

  const handleLogoClick = () => {
    if (pathname !== "/") {
      router.push("/");
    } else if (onNavClick) {
      onNavClick("beranda");
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isScrolled
          ? "bg-blue-600/95 backdrop-blur-md border-b border-blue-500/40 text-white shadow-lg shadow-blue-950/10"
          : "bg-blue-50/70 dark:bg-slate-900/90 backdrop-blur-sm border-b border-transparent text-foreground"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand Name — Menyesuaikan tampilan saat di atas (bubble 3D) dan saat di-scroll (3D putih + sky shimmer) */}
        <div
          onClick={handleLogoClick}
          className="flex items-center cursor-pointer select-none group"
        >
          <span className="text-xl sm:text-2xl font-black tracking-tight font-display select-none py-0.5 transition-transform group-hover:scale-105 flex items-baseline">
            <span
              className={cn(
                "inline-block font-script text-2xl sm:text-3xl font-bold pr-1 transition-all duration-300",
                isScrolled ? "text-3d-white" : "text-3d-bubble-main dark:text-3d-white"
              )}
            >
              All
            </span>
            <ShimmerTitleText variant={isScrolled ? "sky" : "blue"}>
              Projects
            </ShimmerTitleText>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          ref={navRef}
          aria-label="Navigasi Menu Utama"
          className="relative hidden md:flex items-center gap-1"
        >
          {/* Animated Sliding Indicator Pill — Glass transparan saat scroll, solid blue saat di atas */}
          <div
            ref={activePillRef}
            className={cn(
              "absolute top-0 left-0 pointer-events-none rounded-full z-0 will-change-transform will-change-opacity transition-[background-color,border-color,box-shadow] duration-300",
              isScrolled
                ? "bg-white/20 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.15)]"
                : "bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.25)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] border-0"
            )}
            style={{ opacity: 0 }}
          />

          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  buttonRefs.current[item.id] = el;
                }}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "relative z-10 flex h-9 items-center justify-center px-4 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 select-none",
                  isActive
                    ? "text-white"
                    : isScrolled
                    ? "text-blue-100 hover:text-white hover:bg-white/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: GitHub Link & Theme Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* GitHub Profile Link */}
          <a
            href="https://github.com/Aldikurniawan19"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile Aldikurniawan19"
            title="Kunjungi GitHub Aldikurniawan19"
            className={cn(
              "group relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 select-none hover:-translate-y-0.5 active:translate-y-0.5",
              isScrolled
                ? "border border-white/25 bg-white/15 hover:bg-white/25 active:bg-white/20 backdrop-blur-sm text-white shadow-sm"
                : "border border-slate-200/90 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_0_#cbd5e1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_0_#0f172a]"
            )}
          >
            <GithubBrandIcon
              className={cn(
                "h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110",
                isScrolled ? "text-white" : "text-slate-800 dark:text-white"
              )}
            />
          </a>

          {/* Theme Toggle Button */}
          <ThemeToggle variant={isScrolled ? "glass" : "default"} />
        </div>
      </div>
    </header>
  );
}
