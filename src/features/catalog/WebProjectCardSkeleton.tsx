"use client";

import React from "react";

export function WebProjectCardSkeleton({ delayMs = 0 }: { delayMs?: number }) {
  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      className="flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden h-full animate-pulse"
    >
      {/* Aspect Ratio Square Image Skeleton */}
      <div className="aspect-[16/10] sm:aspect-[4/3] w-full bg-slate-200 dark:bg-slate-800" />

      {/* Content Skeleton */}
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-full rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-5/6 rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Tech Badges Skeleton */}
        <div className="pt-2 flex flex-wrap gap-1.5">
          <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-14 rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
