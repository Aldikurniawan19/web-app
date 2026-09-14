"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AdminLoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Harap masukkan username dan password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Kredensial login tidak valid.");
      }

      // Ambil parameter redirect tujuan (?from=...) di sisi client saat submit
      let fromUrl = "/admin";
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        fromUrl = searchParams.get("from") || "/admin";
      }

      // Berhasil login -> redirect
      router.push(fromUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat autentikasi.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
          <Lock className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 px-3 py-0.5 text-[11px] font-bold text-blue-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Area Khusus Terproteksi</span>
          </div>
          <h1 className="text-xl font-black text-white font-display">
            Portal Admin AppHub
          </h1>
          <p className="text-xs text-slate-400">
            Silakan masuk dengan akun administrator Anda untuk mengelola upload APK dan deskripsi.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-900/50 bg-rose-950/40 p-3.5 text-xs text-rose-300 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Username Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Username
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username admin"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Kunci Akses (Password)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          disabled={loading}
          className="mt-6 h-11 text-xs font-bold shadow-lg shadow-blue-500/20"
        >
          <span>{loading ? "Memverifikasi..." : "Masuk ke Dashboard"}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {/* Security Notice */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 text-center text-[11px] text-slate-500">
        Akses ke portal ini dipantau secara ketat. Sesi tidak aktif akan kedaluwarsa secara otomatis.
      </div>
    </div>
  );
}
