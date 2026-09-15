"use client";

import React from "react";
import { Star, HardDrive, ChevronRight } from "lucide-react";
import { AppItem } from "@/types/store";
import { AppIcon } from "@/components/ui/AppIcon";
import { PlatformBadge } from "@/components/ui/PlatformBadge";

interface AppCardProps {
  app: AppItem;
  onOpenDetail: (app: AppItem) => void;
  onDownload?: (app: AppItem) => void;
}

export function AppCard({ app, onOpenDetail }: AppCardProps) {
  return (
    <div
      onClick={() => onOpenDetail(app)}
      className="group relative flex w-full flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm transition-[border-color,box-shadow,background-color] duration-200 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:bg-slate-50/40 dark:hover:bg-slate-800/50 active:scale-[0.99] cursor-pointer"
    >
      {/* Left: App Icon & Detailed Content */}
      <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
        <AppIcon
          type={app.iconType}
          iconUrl={app.iconUrl}
          colorClass={app.iconColor}
          size="md"
          className="h-14 w-14 rounded-2xl shrink-0 group-hover:scale-105 transition-transform"
        />

        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title & Category Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-bold text-foreground font-display group-hover:text-primary transition-colors">
              {app.name}
            </h3>
            <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-semibold text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              {app.category}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-1 sm:line-clamp-2 max-w-2xl">
            {app.description}
          </p>

          {/* Meta Info (Rating, Size, Version, Platforms) */}
          <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{app.rating.toFixed(1)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <span>{app.fileSize}</span>
            </div>
            <span>•</span>
            <span className="hidden sm:inline">Versi {app.version}</span>
            <span className="hidden sm:inline">•</span>
            <PlatformBadge platforms={app.platforms} />
          </div>
        </div>
      </div>

      {/* Right: Lihat Detail Action Button */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 sm:pl-5">
        <div className="sm:hidden">
          <PlatformBadge platforms={app.platforms} />
        </div>

        <div className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 px-4 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] transition-all group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_3.5px_0_#1d4ed8,0_5px_10px_rgba(37,99,235,0.28)] group-hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#1d4ed8] select-none">
          <span className="leading-none">Lihat Detail</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}

