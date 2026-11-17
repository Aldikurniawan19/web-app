"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  AlertCircle,
  X,
  Smartphone,
  CheckCircle2,
  Link as LinkIcon,
  RefreshCw,
  FolderArchive,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GithubAssetItem {
  id: number;
  name: string;
  size: number;
  formattedSize: string;
  downloadUrl: string;
  downloadCount: number;
  releaseTag: string;
  createdAt: string;
}

interface ApkUploadDropzoneProps {
  onFileUploaded: (data: {
    fileName: string;
    fileSize: string;
    downloadUrl: string;
    sha256?: string;
  }) => void;
  currentFileName?: string;
  currentFileSize?: string;
  currentDownloadUrl?: string;
}

export function ApkUploadDropzone({
  onFileUploaded,
  currentFileName,
  currentFileSize,
  currentDownloadUrl,
}: ApkUploadDropzoneProps) {
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual URL states
  const [inputUrl, setInputUrl] = useState(currentDownloadUrl || "");
  const [inputSize, setInputSize] = useState(currentFileSize || "80.0 MB");
  const [inputFileName, setInputFileName] = useState(currentFileName || "");

  // GitHub Release Assets Picker state
  const [githubAssets, setGithubAssets] = useState<GithubAssetItem[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [showAssetsPicker, setShowAssetsPicker] = useState(false);

  const [fileDetails, setFileDetails] = useState<{
    fileName: string;
    fileSize: string;
    downloadUrl: string;
  } | null>(
    currentFileName || currentDownloadUrl
      ? {
          fileName: currentFileName || "app-release.apk",
          fileSize: currentFileSize || "80.0 MB",
          downloadUrl:
            currentDownloadUrl ||
            `https://github.com/Aldikurniawan19/app-release/releases/download/apk-releases/${currentFileName || "app-release.apk"}`,
        }
      : null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ambil daftar aset dari GitHub Releases
  const fetchGithubAssets = async () => {
    setIsLoadingAssets(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/github-assets");
      const json = await res.json();
      if (res.ok && json.success) {
        setGithubAssets(json.data || []);
        setShowAssetsPicker(true);
      } else {
        throw new Error(json.message || "Gagal mengambil aset dari GitHub Releases.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat aset GitHub.";
      setErrorMsg(msg);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Pilih berkas dari daftar aset GitHub
  const handleSelectGithubAsset = (asset: GithubAssetItem) => {
    const details = {
      fileName: asset.name,
      fileSize: asset.formattedSize,
      downloadUrl: asset.downloadUrl,
    };
    setFileDetails(details);
    setInputUrl(asset.downloadUrl);
    setInputFileName(asset.name);
    setInputSize(asset.formattedSize);
    setShowAssetsPicker(false);
    setErrorMsg(null);
    onFileUploaded(details);
  };

  // Terapkan URL manual
  const handleApplyUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanUrl = inputUrl.trim();
    if (!cleanUrl) {
      setErrorMsg("Masukkan tautan URL unduhan berkas APK.");
      return;
    }

    try {
      // Ambil nama file dari URL jika belum diisi
      let derivedName = inputFileName.trim();
      if (!derivedName) {
        const urlObj = new URL(cleanUrl);
        derivedName = decodeURIComponent(urlObj.pathname.split("/").pop() || "app-release.apk");
      }
      if (!derivedName.toLowerCase().endsWith(".apk")) {
        derivedName = `${derivedName}.apk`;
      }

      const finalSize = inputSize.trim() || "80.0 MB";
      const details = {
        fileName: derivedName,
        fileSize: finalSize,
        downloadUrl: cleanUrl,
      };

      setFileDetails(details);
      setInputFileName(derivedName);
      onFileUploaded(details);
    } catch {
      setErrorMsg("Format URL tidak valid. Pastikan diawali http:// atau https://");
    }
  };

  // Proses upload file biner (Lokal / Direct)
  const processFile = async (file: File) => {
    setErrorMsg(null);

    if (!file.name.toLowerCase().endsWith(".apk")) {
      setErrorMsg("Hanya berkas Android Package (.apk) yang didukung.");
      return;
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = `${sizeInMb} MB`;

    // Jika ukuran file di atas 4.5 MB dan di-host di Vercel, beri peringatan solutif
    if (file.size > 4.5 * 1024 * 1024 && typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
      setErrorMsg(
        "Ukuran berkas melebihi 4.5 MB (batas serverless Vercel). Silakan unggah berkas langsung ke GitHub Releases, lalu gunakan tab 'Tautan GitHub Release' di atas."
      );
      return;
    }

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
      const text = await res.text();
      let json: {
        success?: boolean;
        message?: string;
        data?: { fileName?: string; fileSize?: string; downloadUrl?: string; sha256?: string };
      };
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(
          res.status === 413
            ? "Ukuran berkas melebihi batas upload Vercel (4.5 MB). Gunakan opsi Tautan GitHub Release di atas."
            : `Gagal mengunggah berkas (${res.status}): ${text.slice(0, 80)}`
        );
      }

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
          sha256: json.data?.sha256,
        };
        setFileDetails(resultData);
        setInputUrl(resultData.downloadUrl);
        setInputFileName(resultData.fileName);
        setInputSize(resultData.fileSize);
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
    setInputUrl("");
    setInputFileName("");
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

      {/* Mode Switcher Tabs */}
      {!fileDetails && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("url");
              setErrorMsg(null);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "url"
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Tautan GitHub Release</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("upload");
              setErrorMsg(null);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "upload"
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Unggah Berkas Langsung</span>
          </button>
        </div>
      )}

      {fileDetails ? (
        /* Summary Box Berkas APK Terpilih */
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 transition-all">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900 truncate max-w-xs">
                  {fileDetails.fileName}
                </span>
                <span className="flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Siap Didownload</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ukuran: <strong className="text-slate-700">{fileDetails.fileSize}</strong>
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-sm font-mono mt-0.5">
                {fileDetails.downloadUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={fileDetails.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
              title="Uji Tautan Unduh"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
              title="Ganti tautan atau berkas"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : activeTab === "url" ? (
        /* Tab Tautan GitHub Release / Manual URL */
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">
              Tautan Unduhan APK di GitHub Releases
            </label>
            <button
              type="button"
              onClick={fetchGithubAssets}
              disabled={isLoadingAssets}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors"
            >
              <RefreshCw className={cn("h-3 w-3", isLoadingAssets && "animate-spin")} />
              <span>{isLoadingAssets ? "Memuat Aset..." : "Pilih dari GitHub"}</span>
            </button>
          </div>

          {/* Modal / Daftar Aset GitHub Releases */}
          {showAssetsPicker && (
            <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50/60 p-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderArchive className="h-4 w-4 text-primary" />
                  <span>Aset APK di Repositori GitHub:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAssetsPicker(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {githubAssets.length === 0 ? (
                <p className="text-xs text-slate-500 py-1">
                  Tidak ditemukan aset APK di repositori GitHub ini.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {githubAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectGithubAsset(asset)}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white border border-slate-200 hover:border-primary cursor-pointer transition-all hover:shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {asset.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Ukuran: {asset.formattedSize} ({asset.downloadCount} kali diunduh)
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        Pilih
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                // Ekstrak nama berkas otomatis dari URL
                try {
                  const parts = e.target.value.split("/");
                  const lastPart = parts[parts.length - 1];
                  if (lastPart && lastPart.includes(".apk")) {
                    setInputFileName(decodeURIComponent(lastPart.split("?")[0]));
                  }
                } catch {
                  // abaikan
                }
              }}
              placeholder="https://github.com/Aldikurniawan19/app-release/releases/download/apk-releases/app-release.apk"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Nama Berkas APK:
                </label>
                <input
                  type="text"
                  value={inputFileName}
                  onChange={(e) => setInputFileName(e.target.value)}
                  placeholder="Contoh: kalmeda.apk"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Ukuran Berkas:
                </label>
                <input
                  type="text"
                  value={inputSize}
                  onChange={(e) => setInputSize(e.target.value)}
                  placeholder="Contoh: 81.9 MB"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleApplyUrl()}
              disabled={!inputUrl.trim()}
              className="w-full mt-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold py-2.5 transition-all shadow-sm shadow-primary/20"
            >
              Terapkan Tautan APK
            </button>
          </div>
        </div>
      ) : (
        /* Tab Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer select-none",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-slate-300 hover:border-primary/60 hover:bg-slate-50/50"
          )}
        >
          {uploadProgress !== null ? (
            <div className="w-full max-w-xs space-y-3 py-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Mengunggah APK ke server...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-primary transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary group-hover:scale-110 transition-transform shadow-inner">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  Tarik & letakkan berkas <span className="text-primary font-mono">.apk</span> di sini
                </p>
                <p className="text-xs text-slate-500">
                  atau klik untuk memilih berkas dari komputer (Disarankan berkas di bawah 4.5 MB jika di Vercel)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
