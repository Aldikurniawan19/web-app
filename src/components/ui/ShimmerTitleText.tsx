"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

interface ShimmerTitleTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "blue" | "sky";
  showSparkles?: boolean;
}

/**
 * Komponen teks judul dengan animasi kilau cahaya menjalar dan kilauan bintang (sparkles)
 * menggunakan GSAP (@gsap/react).
 */
export function ShimmerTitleText({
  children,
  className,
  variant = "blue",
  showSparkles = true,
}: ShimmerTitleTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const sparkleLeftRef = useRef<SVGSVGElement>(null);
  const sparkleRightRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (!textRef.current) return;

      const masterTl = gsap.timeline({
        repeat: -1,
        repeatDelay: 2.2,
      });

      // Animasi cahaya berkilau (beam sweep) menjalar melintasi teks
      masterTl.fromTo(
        textRef.current,
        { backgroundPosition: "200% 0" },
        {
          backgroundPosition: "-60% 0",
          duration: 2.3,
          ease: "power2.inOut",
        },
        0
      );

      // Kilauan bintang kiri (muncul di awal sweep)
      if (sparkleLeftRef.current) {
        masterTl
          .fromTo(
            sparkleLeftRef.current,
            { scale: 0, opacity: 0, rotation: 0 },
            {
              scale: 1,
              opacity: 0.95,
              rotation: -60,
              duration: 0.4,
              ease: "back.out(2)",
            },
            0.35
          )
          .to(
            sparkleLeftRef.current,
            {
              scale: 0,
              opacity: 0,
              rotation: -120,
              duration: 0.35,
              ease: "power2.in",
            },
            0.85
          );
      }

      // Kilauan bintang kanan (muncul di puncak sweep)
      if (sparkleRightRef.current) {
        masterTl
          .fromTo(
            sparkleRightRef.current,
            { scale: 0, opacity: 0, rotation: 0 },
            {
              scale: 1.25,
              opacity: 1,
              rotation: 45,
              duration: 0.45,
              ease: "back.out(2.2)",
            },
            1.1
          )
          .to(
            sparkleRightRef.current,
            {
              scale: 0,
              opacity: 0,
              rotation: 110,
              duration: 0.4,
              ease: "power2.in",
            },
            1.65
          );
      }
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <span
      ref={containerRef}
      className={cn("relative inline-block select-none", className)}
    >
      {/* Teks dengan Gradien Cahaya Shimmer */}
      <span
        ref={textRef}
        className={cn(
          "inline-block",
          variant === "sky" ? "text-shimmer-sky" : "text-shimmer-blue"
        )}
      >
        {children}
      </span>

      {showSparkles && (
        <>
          {/* Sparkle Kiri */}
          <svg
            ref={sparkleLeftRef}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn(
              "pointer-events-none absolute -top-1 -left-2.5 h-3.5 w-3.5 opacity-0 z-10",
              variant === "sky"
                ? "text-sky-100 dark:text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]"
                : "text-sky-400 dark:text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]"
            )}
            aria-hidden="true"
          >
            <path d="M12 0L14.3 8.7L23 11L14.3 13.3L12 22L9.7 13.3L1 11L9.7 8.7L12 0Z" />
          </svg>

          {/* Sparkle Kanan */}
          <svg
            ref={sparkleRightRef}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn(
              "pointer-events-none absolute -top-2.5 -right-3 h-[18px] w-[18px] opacity-0 z-10",
              variant === "sky"
                ? "text-white dark:text-sky-200 drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
                : "text-blue-400 dark:text-sky-200 drop-shadow-[0_0_10px_rgba(96,165,250,1)]"
            )}
            aria-hidden="true"
          >
            <path d="M12 0L14.3 8.7L23 11L14.3 13.3L12 22L9.7 13.3L1 11L9.7 8.7L12 0Z" />
          </svg>
        </>
      )}
    </span>
  );
}
