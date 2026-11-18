"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerTitleTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "blue" | "sky";
  showSparkles?: boolean;
}

/**
 * Komponen teks judul dengan efek kilau cahaya dan bintang ringan berbasis CSS murni
 * agar hemat CPU dan bebas tugas JS berulang pada main-thread.
 */
export function ShimmerTitleText({
  children,
  className,
  variant = "blue",
  showSparkles = false,
}: ShimmerTitleTextProps) {
  return (
    <span className={cn("relative inline-block select-none", className)}>
      {/* Teks dengan Gradien Cahaya Shimmer CSS */}
      <span
        className={cn(
          "inline-block shimmer-text-sweep",
          variant === "sky" ? "text-shimmer-sky" : "text-shimmer-blue"
        )}
      >
        {children}
      </span>

      {showSparkles && (
        <>
          {/* Sparkle Kiri */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn(
              "pointer-events-none absolute -top-1 -left-2.5 h-3.5 w-3.5 z-10 shimmer-sparkle-left",
              variant === "sky"
                ? "text-sky-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]"
                : "text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]"
            )}
            aria-hidden="true"
          >
            <path d="M12 0L14.3 8.7L23 11L14.3 13.3L12 22L9.7 13.3L1 11L9.7 8.7L12 0Z" />
          </svg>

          {/* Sparkle Kanan */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn(
              "pointer-events-none absolute -top-2.5 -right-3 h-[18px] w-[18px] z-10 shimmer-sparkle-right",
              variant === "sky"
                ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
                : "text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,1)]"
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
