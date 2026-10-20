"use client";

import React from "react";
import { ExternalLink, Globe, Sparkles, Code2, Eye } from "lucide-react";
import { WebProjectItem } from "@/types/web-project";
import { cn } from "@/lib/utils";

interface WebProjectCardProps {
  project: WebProjectItem;
  onOpenDetail?: (project: WebProjectItem) => void;
}

export function WebProjectCard({ project, onOpenDetail }: WebProjectCardProps) {
  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(project)}
      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 cursor-pointer overflow-hidden h-full"
    >
      {/* Top: Foto Tampilan Sekilas (Persegi & Proporsional) */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={`Tampilan sekilas ${project.name}`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-slate-400 dark:text-slate-500 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-primary shadow-sm">
              <Globe className="h-7 w-7" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pratinjau Web
            </span>
          </div>
        )}

        {/* Browser Mockup Top Bar Overlay */}
        <div className="absolute top-0 inset-x-0 h-6 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-3 text-[10px] text-white/80">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500/80" />
            <span className="h-2 w-2 rounded-full bg-amber-500/80" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-1 font-mono text-[9px] text-slate-300 truncate max-w-[150px]">
            <Globe className="h-2.5 w-2.5 text-primary" />
            <span className="truncate">{project.liveUrl?.replace(/^https?:\/\//, "") || "web.project"}</span>
          </div>
        </div>

        {/* Floating Category Badge & Featured Tag */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm border border-white/10">
            {project.category || "Web App"}
          </span>

          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-primary/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              <Sparkles className="h-3 w-3" />
              <span>Unggulan</span>
            </span>
          )}
        </div>
      </div>

      {/* Middle: Content Info (Nama, Deskripsi, Teknologi) */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Nama Web */}
          <h3 className="text-base sm:text-lg font-bold text-foreground font-display group-hover:text-primary transition-colors line-clamp-1">
            {project.name}
          </h3>

          {/* Deskripsi Singkat */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Teknologi yang Digunakan */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <Code2 className="h-3.5 w-3.5 text-primary" />
            <span>Teknologi</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {project.technologies && project.technologies.length > 0 ? (
              project.technologies.slice(0, 4).map((tech, idx) => (
                <span
                  key={`${project.id}-tech-${idx}`}
                  className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                >
                  {tech}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-400">Teknologi modern</span>
            )}
            {project.technologies && project.technologies.length > 4 && (
              <span className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer: Action Buttons */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenDetail) onOpenDetail(project);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Detail</span>
        </button>

        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 px-4 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] transition-all hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_3.5px_0_#1d4ed8,0_5px_10px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#1d4ed8] select-none"
          >
            <span>Kunjungi Web</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenDetail) onOpenDetail(project);
            }}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors select-none"
          >
            <span>Lihat Pratinjau</span>
          </button>
        )}
      </div>
    </div>
  );
}
