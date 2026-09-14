import React, { Suspense } from "react";
import { AdminLoginForm } from "@/features/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 selection:bg-primary selection:text-white">
      {/* Background Decorative Radial Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" />

      <div className="relative w-full max-w-md">
        <Suspense
          fallback={
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center text-xs text-slate-400">
              Memuat formulir autentikasi...
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
