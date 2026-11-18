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
    // Elemen yang sudah terlihat atau terlewati di viewport tidak perlu disembunyikan
    if (rect.top < window.innerHeight * 0.98) {
      setRevealState("settled");
      return;
    }

    setRevealState("hidden");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            entry.isIntersecting ||
            entry.boundingClientRect.top < window.innerHeight
          ) {
            setRevealState("visible");
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -24px 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
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
