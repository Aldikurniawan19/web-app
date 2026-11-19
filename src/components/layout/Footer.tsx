import React from "react";
import Link from "next/link";
import { ShimmerTitleText } from "@/components/ui/ShimmerTitleText";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navigations = [
    { label: "Beranda", href: "/" },
    { label: "Katalog Aplikasi Android", href: "/aplikasi" },
    { label: "Katalog Projek Web", href: "/projek-web" },
    { label: "Bukti Cek Virus APK", href: "/#keamanan" },
    { label: "Panduan Pasang APK", href: "/#panduan-apk" },
  ];

  const resources = [
    { label: "Download APK Terbaru", href: "/aplikasi" },
    { label: "Koleksi Web App Modern", href: "/projek-web" },
    { label: "Verifikasi VirusTotal", href: "/#keamanan" },
    {
      label: "GitHub AllProjects",
      href: "https://github.com/Aldikurniawan19",
      external: true,
    },
  ];

  return (
    <footer className="relative w-full overflow-hidden">
      {/* Organic Wave Divider on Top of Footer */}
      <div className="w-full overflow-hidden leading-none pointer-events-none select-none -mb-[1px]">
        <svg
          className="relative block w-full h-16 sm:h-24 md:h-28 lg:h-36 text-blue-600"
          viewBox="0 0 1440 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Layer 1: Atmospheric Back Wave with Soft Glow */}
          <path
            d="M0,90 C320,10 640,150 960,30 C1200,-10 1360,70 1440,80 L1440,180 L0,180 Z"
            className="fill-blue-500/25"
          />
          {/* Layer 2: Main Dynamic Wave matching Footer Background */}
          <path
            d="M0,40 C360,150 720,0 1080,120 C1280,160 1380,90 1440,60 L1440,180 L0,180 Z"
            className="fill-current"
          />
        </svg>
      </div>

      {/* Main Footer Container */}
      <div className="bg-blue-600 pt-6 sm:pt-8 pb-10 sm:pb-12 text-white transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-12 lg:gap-12 pb-10">
            {/* Col 1: Brand Info (Spans 6 cols on md) */}
            <div className="space-y-4 md:col-span-6">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="text-xl sm:text-2xl font-black tracking-tight font-display select-none py-0.5 flex items-baseline"
                  aria-label="Beranda AllProjects"
                >
                  <span className="inline-block font-script text-2xl sm:text-3xl font-bold text-3d-white pr-1">
                    All
                  </span>
                  <ShimmerTitleText variant="sky" showSparkles={true}>
                    Projects
                  </ShimmerTitleText>
                </Link>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed max-w-md">
                AllProjects (AlllProjek / AllProjek) adalah platform katalog untuk menemukan dan mengunduh aplikasi Android APK gratis yang terverifikasi bebas virus VirusTotal, sekaligus mengeksplorasi berbagai projek web modern.
              </p>
            </div>

            {/* Col 2: Navigasi (Spans 3 cols on md) */}
            <nav aria-label="Navigasi Footer" className="space-y-3 md:col-span-3">
              <h3 className="text-xs font-black uppercase tracking-wider font-display select-none py-0.5 text-white">
                Navigasi
              </h3>
              <ul className="space-y-2 text-xs text-blue-100">
                {navigations.map((nav) => (
                  <li key={nav.label}>
                    <Link
                      href={nav.href}
                      className="hover:text-white transition-colors block py-0.5"
                    >
                      {nav.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Col 3: Ekosistem & Tautan (Spans 3 cols on md) */}
            <div className="space-y-3 md:col-span-3">
              <h3 className="text-xs font-black uppercase tracking-wider font-display select-none py-0.5 text-white">
                Ekosistem
              </h3>
              <ul className="space-y-2 text-xs text-blue-100">
                {resources.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors block py-0.5"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="hover:text-white transition-colors block py-0.5"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-blue-500/30 pt-8 pb-16 md:pb-0 text-xs text-blue-200/90">
            <p>© {currentYear} AllProjects Studio (alllprojects.my.id).</p>
            <div className="flex items-center gap-6 text-xs text-blue-100">
              <Link href="/aplikasi" className="hover:text-white transition-colors">
                Aplikasi Android
              </Link>
              <Link href="/projek-web" className="hover:text-white transition-colors">
                Projek Web
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
