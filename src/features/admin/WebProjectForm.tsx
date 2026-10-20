"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Globe,
  UploadCloud,
  X,
  Plus,
  Code2,
  Sparkles,
  Link as LinkIcon,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { WebProjectItem, CreateWebProjectInput } from "@/types/web-project";
import { Button } from "@/components/ui/Button";
import { clearCatalogSessionCache } from "@/context/CatalogContext";

interface WebProjectFormProps {
  initialData?: WebProjectItem | null;
  isEditing?: boolean;
}

const COMMON_TECH_SUGGESTIONS = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "JavaScript",
  "Supabase",
  "PostgreSQL",
  "Prisma",
  "Node.js",
  "Express",
  "Vue",
  "Svelte",
  "Python",
  "FastAPI",
  "Docker",
  "GSAP",
];

const WEB_CATEGORIES = [
  "Web App",
  "SaaS",
  "Landing Page",
  "E-Commerce",
  "Portfolio",
  "Dashboard",
  "Fintech",
  "Produktivitas",
];

export function WebProjectForm({ initialData, isEditing = false }: WebProjectFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [technologies, setTechnologies] = useState<string[]>(
    initialData?.technologies || ["Next.js", "TypeScript", "Tailwind CSS"]
  );
  const [customTechInput, setCustomTechInput] = useState("");
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl || "");
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || "");
  const [category, setCategory] = useState(initialData?.category || "Web App");
  const [featured, setFeatured] = useState<boolean>(initialData?.featured ?? false);

  // Tambah teknologi baru
  const handleAddTechnology = (techName: string) => {
    const trimmed = techName.trim();
    if (!trimmed) return;
    if (!technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
    }
    setCustomTechInput("");
  };

  const handleRemoveTechnology = (techToRemove: string) => {
    setTechnologies(technologies.filter((t) => t !== techToRemove));
  };

  // Upload Foto Tampilan Sekilas
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Hanya berkas gambar (PNG, JPG, WebP) yang diizinkan.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Ukuran gambar maksimal adalah 10 MB.");
      return;
    }

    try {
      setUploadingImage(true);
      setErrorMsg(null);

      // Unggah via API upload gambar
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "x-file-name": encodeURIComponent(file.name),
          "x-file-type": "image",
          "content-type": file.type,
        },
        body: file,
      });

      const json = await res.json();
      if (res.ok && json.success && json.data?.downloadUrl) {
        setImageUrl(json.data.downloadUrl);
      } else {
        // Fallback FileReader base64 lokal jika server upload terkendala
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImageUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg("Nama web wajib diisi.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Deskripsi singkat wajib diisi.");
      return;
    }
    if (technologies.length === 0) {
      setErrorMsg("Paling sedikit masukkan satu teknologi yang digunakan.");
      return;
    }

    setLoading(true);

    try {
      const payload: CreateWebProjectInput = {
        id:
          initialData?.id ||
          name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-"),
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl || null,
        technologies,
        liveUrl: liveUrl.trim() || null,
        githubUrl: githubUrl.trim() || null,
        category: category.trim() || "Web App",
        featured,
      };

      const res = await fetch("/api/admin/web-projects", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menyimpan projek web ke database Supabase.");
      }

      clearCatalogSessionCache();

      setSuccessMsg(
        isEditing
          ? "Projek web berhasil diperbarui di database Supabase."
          : "Projek web baru berhasil ditambahkan ke katalog."
      );

      setTimeout(() => {
        router.push("/admin/web-projects");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kegagalan komunikasi dengan server.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali</span>
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            {isEditing ? "Edit Projek Web" : "Tambah Projek Web Baru"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lengkapi nama web, foto tampilan sekilas, deskripsi singkat, dan teknologi yang digunakan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/web-projects")}
          >
            Batal
          </Button>

          <Button type="submit" variant="primary" size="sm" disabled={loading || uploadingImage}>
            <Save className="h-4 w-4" />
            <span>{loading ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Terbitkan Projek"}</span>
          </Button>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-700 dark:text-rose-400 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Section 1: Informasi Dasar */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span>1. Informasi Utama Web</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nama Web */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nama Web <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: AeroSync Cloud Web, FinTrack Analytics"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Kategori Web */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Kategori Web
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {WEB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Featured / Unggulan */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2.5">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Tandai sebagai Projek Unggulan</span>
              </span>
            </label>
          </div>

          {/* URL Live Web */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <LinkIcon className="h-3 w-3 text-slate-400" />
              <span>URL Web / Live Demo</span>
            </label>
            <input
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* URL GitHub / Repository */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Code2 className="h-3 w-3 text-slate-400" />
              <span>URL GitHub / Repository (Opsional)</span>
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/project"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Foto Tampilan Sekilas */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span>2. Foto Tampilan Sekilas</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Foto ini akan ditampilkan di card persegi katalog publik dan pratinjau detail.
          </p>
        </div>

        <div className="space-y-4">
          {imageUrl ? (
            <div className="relative aspect-[16/10] sm:aspect-[2/1] w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 group shadow-sm">
              <img
                src={imageUrl}
                alt="Pratinjau tampilan sekilas"
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow hover:bg-slate-100 transition-colors"
                >
                  Ganti Foto
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-8 text-center cursor-pointer hover:border-primary hover:bg-blue-50/30 dark:hover:bg-slate-800/60 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-primary mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {uploadingImage ? "Memproses unggahan gambar..." : "Klik untuk unggah foto tampilan sekilas"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Format PNG, JPG, WebP (Rekomendasi rasio persegi / 16:10, maks 10 MB)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleImageFileChange}
          />

          {/* Opsi alternatif input URL gambar langsung */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Atau tempel URL gambar eksternal langsung:
            </label>
            <input
              type="url"
              value={imageUrl || ""}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Deskripsi Singkat */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span>3. Deskripsi Singkat</span>
          </h3>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Deskripsi Singkat Projek <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400">{description.length} karakter</span>
          </div>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan secara singkat kegunaan web, fitur utama, dan tujuan produk ini..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
          />
        </div>
      </div>

      {/* Section 4: Teknologi yang Digunakan */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span>4. Teknologi yang Digunakan</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pilih dari rekomendasi teknologi populer atau ketik nama teknologi lalu tekan Enter.
          </p>
        </div>

        <div className="space-y-4">
          {/* Active Selected Technologies */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Teknologi Terpilih ({technologies.length})
            </label>
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 items-center">
              {technologies.length > 0 ? (
                technologies.map((tech) => (
                  <span
                    key={`selected-${tech}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-xs font-semibold text-primary dark:text-blue-400 shadow-sm"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTechnology(tech)}
                      className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                      title={`Hapus ${tech}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Belum ada teknologi yang dipilih.</span>
              )}
            </div>
          </div>

          {/* Add Custom Tech Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customTechInput}
              onChange={(e) => setCustomTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTechnology(customTechInput);
                }
              }}
              placeholder="Ketik nama teknologi (contoh: Tailwind CSS, Supabase, Redux)..."
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleAddTechnology(customTechInput)}
              className="shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah</span>
            </Button>
          </div>

          {/* Preset Technology Suggestions */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Rekomendasi Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TECH_SUGGESTIONS.map((tech) => {
                const isSelected = technologies.includes(tech);
                return (
                  <button
                    key={`suggest-${tech}`}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveTechnology(tech);
                      } else {
                        handleAddTechnology(tech);
                      }
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                      isSelected
                        ? "border border-primary bg-primary text-white"
                        : "border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {tech}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => router.push("/admin/web-projects")}
        >
          Batal
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading || uploadingImage}
          className="shadow-md shadow-primary/20"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? "Menyimpan ke Supabase..." : isEditing ? "Simpan Perubahan" : "Terbitkan Projek Web"}</span>
        </Button>
      </div>
    </form>
  );
}
