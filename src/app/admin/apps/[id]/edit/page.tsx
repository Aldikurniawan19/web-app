"use client";

import React, { useState, useEffect, use } from "react";
import { AppForm } from "@/features/admin/AppForm";
import { AppItem } from "@/types/store";
import { AlertCircle } from "lucide-react";

interface EditAppPageProps {
  params: Promise<{ id: string }>;
}

export default function EditAppPage({ params }: EditAppPageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams.id;

  const [app, setApp] = useState<AppItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/apps?id=${appId}`);
        const json = await res.json();

        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.message || "Aplikasi tidak ditemukan.");
        }

        setApp(json.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gagal memuat detail aplikasi.";
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };

    if (appId) {
      fetchAppDetail();
    }
  }, [appId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Memuat data formulir aplikasi...
      </div>
    );
  }

  if (errorMsg || !app) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Aplikasi Tidak Ditemukan
        </h3>
        <p className="text-xs text-slate-500">
          {errorMsg || `Aplikasi dengan ID '${appId}' tidak terdaftar dalam sistem.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Edit Informasi & Deskripsi: {app.name}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Perbarui berkas APK, deskripsi, rilis versi baru, atau sesuaikan fitur unggulan.
        </p>
      </div>

      <AppForm initialData={app} isEditing={true} />
    </div>
  );
}
