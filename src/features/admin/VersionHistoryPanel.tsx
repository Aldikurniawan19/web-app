"use client";

import React, { useState, useEffect, useCallback } from "react";
import { History, Trash2, Download, FileText, AlertCircle } from "lucide-react";
import { AppVersionItem } from "@/types/store";

interface VersionHistoryPanelProps {
  appId: string;
}

/**
 * Panel riwayat versi APK yang ditampilkan di halaman edit aplikasi admin.
 * Menampilkan daftar versi lama dengan opsi unduh dan hapus.
 */
export function VersionHistoryPanel({ appId }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<AppVersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/apps/versions?appId=${appId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVersions(json.data);
      }
    } catch {
      console.error("Gagal memuat riwayat versi.");
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleDelete = async (versionId: string) => {
    if (!confirm("Hapus versi APK ini dari riwayat? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    setDeletingId(versionId);
    try {
      const res = await fetch(`/api/admin/apps/versions?id=${versionId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setVersions((prev) => prev.filter((v) => v.id !== versionId));
      }
    } catch {
      console.error("Gagal menghapus versi.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <History className="h-3.5 w-3.5 animate-spin" />
          <span>Memuat riwayat versi...</span>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <History className="h-3.5 w-3.5" />
          <span>Belum ada riwayat versi sebelumnya.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        <History className="h-3.5 w-3.5 text-primary" />
        Riwayat Versi Sebelumnya ({versions.length})
      </h3>

      <div className="space-y-2">
        {versions.map((v) => (
          <div
            key={v.id}
            className="group relative rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 p-3.5 transition-all hover:border-primary/30 hover:bg-primary/[0.02]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    v{v.version}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {v.fileSize}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {formatDate(v.createdAt)}
                  </span>
                </div>

                {v.changelog && (
                  <div className="mt-1.5 flex items-start gap-1.5">
                    <FileText className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {v.changelog}
                    </p>
                  </div>
                )}

                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {v.apkFileName}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={v.apkUrl}
                  download={v.apkFileName}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                  title={`Unduh ${v.apkFileName}`}
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(v.id)}
                  disabled={deletingId === v.id}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-40"
                  title="Hapus versi ini"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
        <span>Maksimal 4 versi tersimpan. Versi terlama otomatis dihapus saat versi baru diunggah.</span>
      </div>
    </div>
  );
}
