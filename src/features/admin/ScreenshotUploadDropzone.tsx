"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  Plus,
  ArrowUp,
  ArrowDown,
  Layers,
} from "lucide-react";
import { AppScreenshot } from "@/types/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ScreenshotUploadDropzoneProps {
  screenshots: AppScreenshot[];
  onChange: (screenshots: AppScreenshot[]) => void;
  maxScreenshots?: number;
}

export function ScreenshotUploadDropzone({
  screenshots = [],
  onChange,
  maxScreenshots = 8,
}: ScreenshotUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | File[]) => {
    setErrorMsg(null);
    const fileArray = Array.from(files);

    const remainingSlots = maxScreenshots - screenshots.length;
    if (remainingSlots <= 0) {
      setErrorMsg(`Maksimal ${maxScreenshots} gambar screenshot telah tercapai.`);
      return;
    }

    const filesToProcess = fileArray.slice(0, remainingSlots);
    if (fileArray.length > remainingSlots) {
      setErrorMsg(`Hanya ${remainingSlots} gambar yang ditambahkan (batas maksimal ${maxScreenshots} screenshot).`);
    }

    const newScreenshots: AppScreenshot[] = [];
    let processedCount = 0;

    filesToProcess.forEach((file, idx) => {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Beberapa berkas dilewati karena bukan format gambar yang valid.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`Berkas "${file.name}" terlalu besar (maksimal 5 MB per gambar).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .trim();

        newScreenshots.push({
          id: `sc-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          title: cleanTitle || `Screenshot ${screenshots.length + newScreenshots.length + 1}`,
          description: "Tangkapan layar antarmuka aplikasi",
          type: "light",
          imageUrl: dataUrl,
        });

        processedCount++;
        if (processedCount === filesToProcess.length) {
          onChange([...screenshots, ...newScreenshots]);
        }
      };

      reader.onerror = () => {
        processedCount++;
        if (processedCount === filesToProcess.length && newScreenshots.length > 0) {
          onChange([...screenshots, ...newScreenshots]);
        }
      };

      reader.readAsDataURL(file);
    });
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
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    const updated = screenshots.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateScreenshot = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updated = [...screenshots];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= screenshots.length) return;

    const updated = [...screenshots];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header Info & Limit Indicator */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Daftar Screenshot Tampilan Aplikasi
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Format PNG, JPG, atau WebP (Rekomendasi rasio vertikal HP atau horizontal, maks. 5 MB).
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
            screenshots.length >= maxScreenshots
              ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900"
              : "bg-blue-50 text-primary border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900"
          )}
        >
          {screenshots.length} / {maxScreenshots} Screenshot
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Grid of Uploaded Screenshots */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {screenshots.map((sc, idx) => (
            <div
              key={sc.id || idx}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3 shadow-xs space-y-3 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              {/* Image Preview & Order Badge */}
              <div className="relative aspect-[9/16] max-h-56 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                {sc.imageUrl ? (
                  <img
                    src={sc.imageUrl}
                    alt={sc.title || `Screenshot ${idx + 1}`}
                    className="h-full w-full object-contain select-none"
                  />
                ) : (
                  <div className="text-center p-3 text-slate-400">
                    <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px]">Mockup Template</span>
                  </div>
                )}

                {/* Index Order Badge */}
                <div className="absolute left-2 top-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                  #{idx + 1}
                </div>

                {/* Top Right Action Buttons (Move & Delete) */}
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/60 p-1 backdrop-blur-xs">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "up")}
                      className="rounded p-1 text-white hover:bg-white/20 transition-colors"
                      title="Pindah ke kiri/atas"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                  )}
                  {idx < screenshots.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "down")}
                      className="rounded p-1 text-white hover:bg-white/20 transition-colors"
                      title="Pindah ke kanan/bawah"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveScreenshot(idx)}
                    className="rounded p-1 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors"
                    title="Hapus screenshot"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Title & Description Form per Screenshot */}
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    Judul Tampilan
                  </label>
                  <input
                    type="text"
                    value={sc.title}
                    onChange={(e) => handleUpdateScreenshot(idx, "title", e.target.value)}
                    placeholder="Contoh: Halaman Beranda"
                    className="mt-0.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    Keterangan Singkat
                  </label>
                  <input
                    type="text"
                    value={sc.description}
                    onChange={(e) => handleUpdateScreenshot(idx, "description", e.target.value)}
                    placeholder="Contoh: Mode gelap adaptif"
                    className="mt-0.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dropzone Trigger (Muncul jika slot < 8) */}
      {screenshots.length < maxScreenshots && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer select-none",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.005]"
              : "border-slate-300 dark:border-slate-700 hover:border-primary/60 dark:hover:border-primary/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
          )}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 dark:bg-slate-800 text-primary group-hover:scale-110 transition-transform shadow-inner">
            <Upload className="h-5 w-5" />
          </div>
          <div className="mt-2.5 space-y-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {screenshots.length === 0
                ? "Pilih atau seret hingga 8 gambar screenshot aplikasi ke sini"
                : `Tambah gambar screenshot lainnya (tersisa ${maxScreenshots - screenshots.length} slot)`}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Dapat memilih beberapa gambar sekaligus (Format: PNG, JPG, WebP)
            </p>
          </div>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
