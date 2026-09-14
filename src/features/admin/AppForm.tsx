"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Layers,
  Sparkles,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import { AppCategory, AppItem } from "@/types/store";
import { CATEGORIES } from "@/constants/app-store-data";
import { ApkUploadDropzone } from "@/features/admin/ApkUploadDropzone";
import { IconUploadDropzone } from "@/features/admin/IconUploadDropzone";
import { Button } from "@/components/ui/Button";

interface AppFormProps {
  initialData?: AppItem | null;
  isEditing?: boolean;
}

export function AppForm({ initialData, isEditing = false }: AppFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialData?.name || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [category, setCategory] = useState<Exclude<AppCategory, "Semua">>(
    initialData?.category || "Produktivitas"
  );
  const [developer, setDeveloper] = useState(initialData?.developer || "AppHub Studio");
  const [version, setVersion] = useState(initialData?.version || "1.0.0");
  const [fileSize, setFileSize] = useState(initialData?.fileSize || "15.0 MB");
  const [description, setDescription] = useState(initialData?.description || "");
  const [longDescription, setLongDescription] = useState(initialData?.longDescription || "");
  
  // Icon image state
  const [iconUrl, setIconUrl] = useState<string | null>(initialData?.iconUrl || null);

  // APK file state
  const [apkUrl, setApkUrl] = useState<string | null>(initialData?.apkUrl || null);
  const [apkFileName, setApkFileName] = useState<string | null>(initialData?.apkFileName || null);

  const [features, setFeatures] = useState<string[]>(
    initialData?.features || [
      "Antarmuka cepat dan responsif",
      "Dukungan mode gelap dan terang",
      "Ringan dan hemat konsumsi baterai",
    ]
  );
  const [newFeatureText, setNewFeatureText] = useState("");

  const [osReq, setOsReq] = useState(initialData?.systemRequirements?.os || "Android 8.0 ke atas");
  const [ramReq, setRamReq] = useState(initialData?.systemRequirements?.ram || "Minimum 2 GB RAM");
  const [storageReq, setStorageReq] = useState(
    initialData?.systemRequirements?.storage || "50 MB ruang bebas"
  );

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFileUploaded = (data: { fileName: string; fileSize: string; downloadUrl: string }) => {
    setFileSize(data.fileSize);
    setApkUrl(data.downloadUrl);
    setApkFileName(data.fileName);
    if (!name) {
      // Auto-extract readable name from filename
      const cleanName = data.fileName
        .replace(/\.apk$/i, "")
        .replace(/[-_]v?[0-9].*$/i, "")
        .replace(/[-_]/g, " ");
      setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg("Nama aplikasi wajib diisi.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Deskripsi singkat wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        id: initialData?.id || name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"),
        name: name.trim(),
        tagline: tagline.trim() || name.trim(),
        category,
        developer: developer.trim(),
        version: version.trim(),
        fileSize: fileSize.trim(),
        description: description.trim(),
        longDescription: longDescription.trim() || description.trim(),
        iconUrl,
        iconType: "document",
        iconColor: "bg-blue-500",
        features,
        systemRequirements: {
          os: osReq,
          ram: ramReq,
          storage: storageReq,
        },
        apkUrl: apkUrl || initialData?.apkUrl || null,
        apkFileName: apkFileName || initialData?.apkFileName || null,
      };

      const res = await fetch("/api/admin/apps", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menyimpan data aplikasi ke database Supabase.");
      }

      setSuccessMsg(
        isEditing
          ? "Pembaruan aplikasi berhasil disimpan di Supabase!"
          : "Aplikasi APK baru berhasil diterbitkan ke katalog Supabase!"
      );

      setTimeout(() => {
        router.push("/admin/apps");
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kegagalan komunikasi dengan server.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top action & back bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/apps")}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-foreground transition-colors group self-start"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Daftar Aplikasi</span>
        </button>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/apps")}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading}
            className="shadow-md shadow-primary/25"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Terbitkan Aplikasi"}</span>
          </Button>
        </div>
      </div>

      {/* Status Alerts */}
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <div className="space-y-1">
            <span className="font-bold">Gagal Menyimpan Data</span>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-4 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <div className="space-y-1">
            <span className="font-bold">Berhasil!</span>
            <p>{successMsg}</p>
          </div>
        </div>
      )}

      {/* Card 1: Upload APK File */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <span>1. Berkas Android Package (.APK)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Berkas APK akan diunggah otomatis ke GitHub Releases dan URL publiknya disimpan di Supabase.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-primary">
            GitHub Releases
          </span>
        </div>

        <ApkUploadDropzone
          onFileUploaded={handleFileUploaded}
          currentFileName={apkFileName || (initialData?.apkUrl ? "Paket APK Tersedia" : undefined)}
          currentFileSize={fileSize}
        />
      </div>

      {/* Card 2: Upload Gambar Ikon Aplikasi */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span>2. Gambar Ikon Aplikasi</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Unggah logo/ikon aplikasi dalam format gambar (PNG, JPG, WebP, SVG). Gambar akan disimpan di Supabase.
          </p>
        </div>

        <IconUploadDropzone
          currentIconUrl={iconUrl}
          onIconChange={(newUrl) => setIconUrl(newUrl)}
        />
      </div>

      {/* Card 3: Informasi Dasar Aplikasi */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <span>3. Informasi Dasar Aplikasi</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detail ini akan ditampilkan pada landing page publik, kartu katalog, dan halaman detail.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Nama Aplikasi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nama Aplikasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Notely, AeroSync"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tagline Ringkas
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Contoh: Aplikasi Pencatat Modern & Cepat"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Kategori <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Exclude<AppCategory, "Semua">)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Developer */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Developer / Studio
            </label>
            <input
              type="text"
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              placeholder="Contoh: AppHub Studio"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Versi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Versi Rilis
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground font-mono focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Ukuran Berkas */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Ukuran Berkas
            </label>
            <input
              type="text"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="12.5 MB"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground font-mono focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Card 4: Deskripsi Singkat & Lengkap */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
            4. Deskripsi & Konten Informasi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tuliskan ringkasan untuk kartu katalog dan ulasan lengkap untuk halaman detail.
          </p>
        </div>

        {/* Deskripsi Singkat */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Deskripsi Singkat (Ringkasan Katalog) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {description.length} karakter
            </span>
          </div>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Aplikasi pencatat cepat dan mudah dengan fitur sinkronisasi cloud."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Deskripsi Lengkap */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Deskripsi Lengkap (Tentang Aplikasi)
          </label>
          <textarea
            rows={5}
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            placeholder="Jelaskan secara komprehensif apa yang membuat aplikasi ini istimewa, kegunaan utamanya, dan keunggulannya..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
          />
        </div>
      </div>

      {/* Card 5: Fitur Utama Aplikasi */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
            5. Poin Fitur Utama
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar fitur kunci yang akan disorot dengan tanda centang pada halaman detail aplikasi.
          </p>
        </div>

        {/* List of features */}
        <div className="space-y-2">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  ✓
                </span>
                <span className="truncate">{feature}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFeature(idx)}
                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                title="Hapus fitur"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new feature row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newFeatureText}
            onChange={(e) => setNewFeatureText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddFeature();
              }
            }}
            placeholder="Tambah poin fitur baru (tekan Enter)..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddFeature}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah</span>
          </Button>
        </div>
      </div>

      {/* Card 6: Persyaratan Sistem */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
            6. Persyaratan Minimum Sistem
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spesifikasi perangkat minimum yang direkomendasikan untuk menjalankan APK ini.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sistem Operasi
            </label>
            <input
              type="text"
              value={osReq}
              onChange={(e) => setOsReq(e.target.value)}
              placeholder="Android 8.0+"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Minimum RAM
            </label>
            <input
              type="text"
              value={ramReq}
              onChange={(e) => setRamReq(e.target.value)}
              placeholder="2 GB RAM"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Ruang Penyimpanan
            </label>
            <input
              type="text"
              value={storageReq}
              onChange={(e) => setStorageReq(e.target.value)}
              placeholder="50 MB bebas"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/apps")}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="px-8 shadow-md shadow-primary/25"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Terbitkan Aplikasi"}</span>
        </Button>
      </div>
    </form>
  );
}
