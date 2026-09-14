"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/features/admin/AdminSidebar";
import { AdminHeader } from "@/features/admin/AdminHeader";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Jika sedang berada di halaman login, tampilkan layar penuh tanpa sidebar & topbar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Tentukan judul header berdasarkan rute
  let pageTitle = "Dashboard Administrator";
  if (pathname === "/admin/apps") {
    pageTitle = "Kelola Semua Aplikasi APK";
  } else if (pathname === "/admin/apps/new") {
    pageTitle = "Unggah & Terbitkan APK Baru";
  } else if (pathname.includes("/edit")) {
    pageTitle = "Edit Informasi Aplikasi";
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex">
      {/* Sidebar Navigasi Admin */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-72 min-w-0">
        <AdminHeader
          title={pageTitle}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
