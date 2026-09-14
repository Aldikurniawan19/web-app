"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IconUploadDropzoneProps {
  currentIconUrl?: string | null;
  onIconChange: (iconUrl: string | null) => void;
}

export function IconUploadDropzone({
  currentIconUrl,
  onIconChange,
}: IconUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentIconUrl || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);

    // Validasi tipe berkas (gambar saja)
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Format berkas tidak valid. Harap pilih gambar (PNG, JPG, WebP, SVG).");
      return;
    }

    // Maksimal 4 MB
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg("Ukuran gambar terlalu besar. Maksimal 4 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      onIconChange(dataUrl);
    };
    reader.onerror = () => {
      setErrorMsg("Gagal membaca berkas gambar.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setErrorMsg(null);
    onIconChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleInputChange}
      />

      {previewUrl ? (
        /* Preview Card */
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-surface-card p-4 transition-all">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none shrink-0">
              <img
                src={previewUrl}
                alt="Preview Ikon Aplikasi"
                className="h-full w-full object-cover select-none"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Gambar Ikon Aktif
                </span>
                <span className="flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Siap Disimpan</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gambar akan disimpan langsung ke database Supabase.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Ganti gambar"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Ganti</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-colors"
              title="Hapus gambar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer select-none",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-slate-300 dark:border-slate-700 hover:border-primary/60 dark:hover:border-primary/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-slate-800 text-primary group-hover:scale-110 transition-transform shadow-inner">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Pilih atau seret gambar ikon di sini
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Format: PNG, JPG, WebP, atau SVG (Rekomendasi rasio 1:1, maks. 4 MB)
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
