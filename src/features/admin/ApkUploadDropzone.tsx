"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  X,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApkUploadDropzoneProps {
  onFileUploaded: (data: { fileName: string; fileSize: string; downloadUrl: string }) => void;
  currentFileName?: string;
  currentFileSize?: string;
}

export function ApkUploadDropzone({
  onFileUploaded,
  currentFileName,
  currentFileSize,
}: ApkUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{
    fileName: string;
    fileSize: string;
    downloadUrl: string;
  } | null>(
    currentFileName
      ? {
          fileName: currentFileName,
          fileSize: currentFileSize || "15.0 MB",
          downloadUrl: `https://github.com/Aldikurniawan19/app-release/releases/download/apk-releases/${currentFileName}`,
        }
      : null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);

    // Validasi format
    if (!file.name.toLowerCase().endsWith(".apk")) {
      setErrorMsg("Hanya berkas Android Package (.apk) yang didukung.");
      return;
    }

    // Ukuran kalkulasi
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = `${sizeInMb} MB`;

    // Mulai upload ke API
    setUploadProgress(20);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 85) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 15;
      });
    }, 120);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "x-file-name": encodeURIComponent(file.name),
          "x-file-type": "apk",
          "Content-Type": "application/octet-stream",
        },
        body: file,
      });

      clearInterval(progressInterval);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mengunggah berkas APK ke server.");
      }

      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(null);
        const defaultGithubUrl = `https://github.com/Aldikurniawan19/app-release/releases/download/apk-releases/${json.data?.fileName || file.name}`;
        const resultData = {
          fileName: json.data?.fileName || file.name,
          fileSize: json.data?.fileSize || formattedSize,
          downloadUrl: json.data?.downloadUrl || defaultGithubUrl,
        };
        setFileDetails(resultData);
        onFileUploaded(resultData);
      }, 300);
    } catch (err: unknown) {
      setUploadProgress(null);
      const msg = err instanceof Error ? err.message : "Terjadi kegagalan saat proses upload.";
      setErrorMsg(msg);
    }
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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setFileDetails(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".apk"
        className="hidden"
        onChange={handleInputChange}
      />

      {fileDetails ? (
        /* Uploaded File Summary Box */
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 transition-all">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {fileDetails.fileName}
                </span>
                <span className="flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Valid APK</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Ukuran Berkas: <strong className="text-slate-700 dark:text-slate-300">{fileDetails.fileSize}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Ganti berkas APK"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer select-none",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-slate-300 dark:border-slate-700 hover:border-primary/60 dark:hover:border-primary/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
          )}
        >
          {uploadProgress !== null ? (
            /* Upload Progress State */
            <div className="w-full max-w-xs space-y-3 py-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Mengunggah APK ke server...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-primary transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            /* Default Idle Dropzone Content */
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-slate-800 text-primary group-hover:scale-110 transition-transform shadow-inner">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Tarik & letakkan berkas <span className="text-primary font-mono">.apk</span> di sini
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  atau klik untuk memilih berkas dari komputer Anda (Maksimal 150 MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
