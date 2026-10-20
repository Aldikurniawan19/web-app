"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Globe, Code2, Sparkles, Calendar } from "lucide-react";
import { WebProjectItem } from "@/types/web-project";

interface WebProjectDetailModalProps {
  project: WebProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WebProjectDetailModal({
  project,
  isOpen,
  onClose,
}: WebProjectDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Tutup jendela pratinjau"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top Header: Category & Title */}
        <div className="space-y-2 pr-10">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-xs font-bold text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              {project.category || "Web App"}
            </span>
            {project.featured && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                <Sparkles className="h-3 w-3" />
                <span>Unggulan</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-foreground font-display">
            {project.name}
          </h2>
        </div>

        {/* Foto Tampilan Sekilas (Besar & Jelas) */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-inner">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={`Tampilan sekilas ${project.name}`}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
              <Globe className="h-12 w-12 text-primary" />
              <p className="mt-2 text-xs font-medium">Tidak ada foto tampilan sekilas</p>
            </div>
          )}
        </div>

        {/* Deskripsi Lengkap & Detail */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Deskripsi Projek
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </div>

        {/* Teknologi yang Digunakan */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <Code2 className="h-4 w-4 text-primary" />
            <span>Teknologi yang Digunakan</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech, idx) => (
              <span
                key={`modal-tech-${idx}`}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 px-5 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              <span>Kunjungi Website Langsung</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
