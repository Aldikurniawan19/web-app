"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Code2,
  Sparkles,
  AlertCircle,
  Eye,
} from "lucide-react";
import { WebProjectItem } from "@/types/web-project";
import { Button } from "@/components/ui/Button";
import { clearCatalogSessionCache } from "@/context/CatalogContext";

export default function AdminWebProjectsPage() {
  const [projects, setProjects] = useState<WebProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<WebProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/web-projects");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setProjects(json.data || []);
        }
      }
    } catch (err) {
      console.error("Gagal memuat projek web:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/web-projects?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        clearCatalogSessionCache();
        setDeleteTarget(null);
        fetchProjects();
      }
    } catch (err) {
      console.error("Gagal menghapus projek web:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.technologies.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Kelola Seluruh Projek Web
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Publikasikan karya website, sesuaikan screenshot tampilan sekilas, deskripsi, dan teknologi yang digunakan.
          </p>
        </div>

        <Link href="/admin/web-projects/new">
          <Button variant="primary" size="sm" className="shadow-sm shadow-primary/20">
            <Plus className="h-4 w-4" />
            <span>Tambah Projek Web Baru</span>
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama web, teknologi, atau deskripsi..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-slate-400 focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-end sm:self-auto">
          {filteredProjects.length} dari {projects.length} projek
        </span>
      </div>

      {/* Grid of Web Projects Cards (persegi preview) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            Memuat daftar projek web...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            Tidak ada projek web yang cocok dengan pencarian Anda.
          </div>
        ) : (
          filteredProjects.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-primary/40 hover:shadow-md transition-all overflow-hidden"
            >
              {/* Top: Foto Tampilan Sekilas */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                    <Globe className="h-8 w-8 text-primary" />
                    <span className="text-[10px] mt-1 font-medium">Tanpa Foto</span>
                  </div>
                )}

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white border border-white/10">
                    {item.category}
                  </span>
                  {item.featured && (
                    <span className="rounded-md bg-primary/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                      Unggulan
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Technologies */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Code2 className="h-3 w-3 text-primary" />
                    <span>Teknologi:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.technologies.map((t, idx) => (
                      <span
                        key={`${item.id}-tech-${idx}`}
                        className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  {item.liveUrl && (
                    <a
                      href={item.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Kunjungi</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/web-projects/${item.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors"
                    title="Hapus projek web"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Konfirmasi Hapus Projek Web
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong>{deleteTarget.name}</strong>? Data projek web ini akan dihapus dari katalog publik.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
              >
                Batal
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
