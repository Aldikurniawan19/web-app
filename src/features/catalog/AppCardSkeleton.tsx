"use client";

import React from "react";

export function AppCardSkeleton() {
  return (
    <div className="relative flex w-full flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm animate-pulse">
      {/* Left: App Icon & Detailed Content */}
      <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0 w-full">
        {/* App Icon Skeleton */}
        <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />

        <div className="flex-1 min-w-0 space-y-2.5 w-full">
          {/* Title & Category Badge Skeleton */}
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-32 sm:w-44 rounded-md bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-20 rounded-md bg-slate-100 dark:bg-slate-800/70" />
          </div>

          {/* Description Skeleton */}
          <div className="space-y-1.5 w-full">
            <div className="h-3.5 w-full rounded bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="h-3.5 w-4/5 rounded bg-slate-100 dark:bg-slate-800/50 hidden sm:block" />
          </div>

          {/* Meta Info (Rating, Size, Version) Skeleton */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="h-3 w-14 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* Right: Action Button Skeleton */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 sm:pl-5 w-full sm:w-auto">
        <div className="sm:hidden h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
