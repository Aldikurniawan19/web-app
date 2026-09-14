"use client";

import React from "react";
import { AppForm } from "@/features/admin/AppForm";

export default function NewAppPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Unggah & Terbitkan Paket APK Baru
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Lengkapi berkas paket Android, metadata aplikasi, deskripsi rinci, dan daftar fitur utama.
        </p>
      </div>

      <AppForm isEditing={false} />
    </div>
  );
}
