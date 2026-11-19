"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

type RevealState = "idle" | "hidden" | "visible" | "settled";

/**
 * Pembungkus animasi scroll ringan berbasis IntersectionObserver + CSS compositor.
 * - Elemen pada viewport awal dan hasil SSR langsung terlihat (tidak mengganggu LCP/Speed Index).
 * - Hanya memakai opacity dan translate3d sehingga bebas Layout Shift (CLS = 0).
 */
export function ScrollReveal({
  children,
  className,
  delayMs = 0,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealState, setRevealState] = useState<RevealState>("idle");

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setRevealState("settled");
      return;
    }

    const rect = element.getBoundingClientRect();
    // Elemen yang sudah terlihat atau mendekati viewport tidak perlu disembunyikan
    if (rect.top < window.innerHeight + 40) {
      setRevealState("settled");
      return;
    }

    setRevealState("hidden");

    let revealed = false;
    const triggerReveal = () => {
      if (revealed) return;
      revealed = true;
      setRevealState("visible");
      observer.disconnect();
      window.removeEventListener("scroll", checkViewportFallback);
      window.removeEventListener("resize", checkViewportFallback);
    };

    // Fallback scroll/resize agar kartu tinggi pada browser seluler tidak pernah terjebak di opacity: 0
    const checkViewportFallback = () => {
      if (revealed) return;
      const currentRect = element.getBoundingClientRect();
      if (currentRect.top < window.innerHeight + 80) {
        triggerReveal();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            entry.isIntersecting ||
            entry.boundingClientRect.top < window.innerHeight + 80
          ) {
            triggerReveal();
            break;
          }
        }
      },
      {
        threshold: 0,
        rootMargin: "0px 0px 80px 0px",
      }
    );

    observer.observe(element);
    window.addEventListener("scroll", checkViewportFallback, { passive: true });
    window.addEventListener("resize", checkViewportFallback, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", checkViewportFallback);
      window.removeEventListener("resize", checkViewportFallback);
    };
  }, []);

  // Lepas kelas transisi/transform setelah animasi masuk selesai agar layer GPU & stacking context bersih
  useEffect(() => {
    if (revealState !== "visible") return;
    const timer = setTimeout(() => {
      setRevealState("settled");
    }, 620 + delayMs);
    return () => clearTimeout(timer);
  }, [revealState, delayMs]);

  return (
    <div
      ref={containerRef}
      onTransitionEnd={(event) => {
        if (event.target === containerRef.current && revealState === "visible") {
          setRevealState("settled");
        }
      }}
      style={
        revealState === "visible" && delayMs > 0
          ? { transitionDelay: `${delayMs}ms` }
          : undefined
      }
      className={cn(
        "min-w-0",
        revealState === "hidden" && "scroll-reveal-hidden",
        revealState === "visible" && "scroll-reveal-visible",
        className
      )}
    >
      {children}
    </div>
  );
}
