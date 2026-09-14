"use client";

import React from "react";
import { Star, Download } from "lucide-react";
import { RELATED_APPS } from "@/constants/app-store-data";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { AppItem } from "@/types/store";

interface RelatedAppsProps {
  onDownloadItem: (appName: string) => void;
}

export function RelatedApps({ onDownloadItem }: RelatedAppsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-black font-display select-none py-0.5">
        <span className="inline-block text-3d-bubble-main">Aplikasi</span>{" "}
        <span className="inline-block text-3d-bubble-blue">Terkait</span>
      </h3>

      <div className="space-y-2.5">
        {RELATED_APPS.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AppIcon
                type={item.iconType}
                colorClass={item.iconColor}
                size="sm"
                className="h-10 w-10 rounded-xl"
              />
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <div className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300 font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span>{item.fileSize}</span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => onDownloadItem(item.name)}
              className="h-8 px-3 text-xs font-semibold rounded-lg"
            >
              <span>Download</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
