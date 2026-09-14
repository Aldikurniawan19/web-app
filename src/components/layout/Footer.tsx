import React from "react";
import { Layers } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navigations = [
    { label: "Beranda", href: "#beranda" },
    { label: "Katalog Aplikasi", href: "#katalog" },
    { label: "Panduan Pasang APK", href: "#panduan-apk" },
    { label: "Aplikasi Terbaru", href: "#katalog" },
  ];

  const legals = [
    { label: "Pusat Bantuan", href: "#" },
    { label: "Kebijakan Privasi", href: "#" },
    { label: "Syarat & Ketentuan", href: "#" },
    { label: "Hubungi Tim AppHub", href: "#" },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 py-10 pb-28 sm:pb-10 text-foreground transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-12 lg:gap-12 pb-10">
          {/* Col 1: Brand Info (Spans 6 cols on md) */}
          <div className="space-y-4 md:col-span-6">
            <div className="flex items-center gap-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logo.png"
                alt="AppHub Logo"
                className="h-11 w-11 sm:h-12 sm:w-12 object-contain drop-shadow-sm -mr-1"
              />
              <span className="text-xl sm:text-2xl font-black tracking-tight font-display select-none py-0.5">
                <span className="inline-block text-3d-bubble-main">App</span>
                <span className="inline-block text-3d-bubble-blue">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Platform terpercaya untuk menemukan, mengeksplorasi, dan mengunduh berbagai aplikasi Android terbaik dengan cepat dan aman.
            </p>
          </div>

          {/* Col 2: Navigasi (Spans 3 cols on md) */}
          <div className="space-y-3 md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-wider font-display select-none py-0.5">
              <span className="inline-block text-3d-bubble-main">Navigasi</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              {navigations.map((nav) => (
                <li key={nav.label}>
                  <a
                    href={nav.href}
                    className="hover:text-primary transition-colors block py-0.5"
                  >
                    {nav.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Dukungan & Legal (Spans 3 cols on md) */}
          <div className="space-y-3 md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-wider font-display select-none py-0.5">
              <span className="inline-block text-3d-bubble-main">Dukungan &</span>{" "}
              <span className="inline-block text-3d-bubble-blue">Legal</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              {legals.map((legal) => (
                <li key={legal.label}>
                  <a
                    href={legal.href}
                    className="hover:text-primary transition-colors block py-0.5"
                  >
                    {legal.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-8 text-xs text-slate-400 dark:text-slate-500">
          <p>© {currentYear} AppHub Studio. Semua hak dilindungi undang-undang.</p>
          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">
              Privasi
            </a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">
              Syarat Layanan
            </a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">
              Keamanan Berkas
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}


