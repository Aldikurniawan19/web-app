"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, History, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppForm } from "@/features/admin/AppForm";
import { NewVersionForm } from "@/features/admin/NewVersionForm";
import { cn } from "@/lib/utils";

function NewAppPageContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "version" ? "version" : "new";
  const appIdParam = searchParams.get("appId") || undefined;

  const [mode, setMode] = useState<"new" | "version">(initialMode);

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {mode === "new"
                ? "Daftarkan Aplikasi Baru"
                : "Upload Versi Baru Manual (GitHub Action)"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {mode === "new"
                ? "Lengkapi informasi aplikasi baru, gambar ikon, screenshot, dan paket APK rilis pertama."
                : "Perbarui berkas APK untuk aplikasi yang sudah ada menggunakan tautan unduhan dari GitHub Action."}
            </p>
          </div>

          <Link
            href="/admin/apps"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-foreground transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Daftar Aplikasi</span>
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setMode("new")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all select-none",
              mode === "new"
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-foreground"
            )}
          >
            <Plus className="h-4 w-4" />
            <span>1. Aplikasi Baru Pertama Kali</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("version")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all select-none",
              mode === "version"
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-foreground"
            )}
          >
            <History className="h-4 w-4" />
            <span>2. Upload Versi Baru Manual (GitHub Action)</span>
          </button>
        </div>
      </div>

      {/* Dynamic Content Form */}
      {mode === "new" ? (
        <AppForm isEditing={false} />
      ) : (
        <NewVersionForm preselectedAppId={appIdParam} />
      )}
    </div>
  );
}

export default function NewAppPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-slate-400">
          Memuat formulir unggah aplikasi...
        </div>
      }
    >
      <NewAppPageContent />
    </Suspense>
  );
}
