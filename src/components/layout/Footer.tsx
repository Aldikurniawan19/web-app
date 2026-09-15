import React from "react";

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
    <footer className="relative w-full overflow-hidden">
      {/* Organic Wave Divider on Top of Footer */}
      <div className="w-full overflow-hidden leading-none pointer-events-none select-none -mb-[1px]">
        <svg
          className="relative block w-full h-16 sm:h-24 md:h-28 lg:h-36 text-blue-600 dark:text-blue-950"
          viewBox="0 0 1440 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Layer 1: Atmospheric Back Wave with Soft Glow */}
          <path
            d="M0,90 C320,10 640,150 960,30 C1200,-10 1360,70 1440,80 L1440,180 L0,180 Z"
            className="fill-blue-500/25 dark:fill-blue-800/40"
          />
          {/* Layer 2: Main Dynamic Wave matching Footer Background */}
          <path
            d="M0,40 C360,150 720,0 1080,120 C1280,160 1380,90 1440,60 L1440,180 L0,180 Z"
            className="fill-current"
          />
        </svg>
      </div>

      {/* Main Footer Container */}
      <div className="bg-blue-600 dark:bg-blue-950 pt-6 sm:pt-8 pb-10 sm:pb-12 text-white transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-12 lg:gap-12 pb-10">
            {/* Col 1: Brand Info (Spans 6 cols on md) */}
            <div className="space-y-4 md:col-span-6">
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl font-black tracking-tight font-display select-none py-0.5">
                  <span className="text-white drop-shadow-sm">App</span>
                  <span className="text-sky-300 drop-shadow-sm">Hub</span>
                </span>
              </div>
              <p className="text-xs text-blue-100 dark:text-blue-200/80 leading-relaxed max-w-md">
                Platform terpercaya untuk menemukan, mengeksplorasi, dan mengunduh berbagai aplikasi Android terbaik dengan cepat dan aman.
              </p>
            </div>

            {/* Col 2: Navigasi (Spans 3 cols on md) */}
            <div className="space-y-3 md:col-span-3">
              <h4 className="text-xs font-black uppercase tracking-wider font-display select-none py-0.5 text-white">
                Navigasi
              </h4>
              <ul className="space-y-2 text-xs text-blue-100 dark:text-blue-200/80">
                {navigations.map((nav) => (
                  <li key={nav.label}>
                    <a
                      href={nav.href}
                      className="hover:text-white transition-colors block py-0.5"
                    >
                      {nav.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Dukungan & Legal (Spans 3 cols on md) */}
            <div className="space-y-3 md:col-span-3">
              <h4 className="text-xs font-black uppercase tracking-wider font-display select-none py-0.5 text-white">
                Dukungan & Legal
              </h4>
              <ul className="space-y-2 text-xs text-blue-100 dark:text-blue-200/80">
                {legals.map((legal) => (
                  <li key={legal.label}>
                    <a
                      href={legal.href}
                      className="hover:text-white transition-colors block py-0.5"
                    >
                      {legal.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-blue-500/30 dark:border-blue-900/50 pt-8 text-xs text-blue-200/90 dark:text-blue-300/70">
            <p>© {currentYear} AppHub Studio.</p>
            <div className="flex items-center gap-6 text-xs text-blue-100 dark:text-blue-200/80">
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                Privasi
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
