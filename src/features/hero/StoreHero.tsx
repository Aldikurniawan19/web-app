"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface StoreHeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: () => void;
}

export function StoreHero({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: StoreHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Staggered text & search bar reveal (berjalan mulus saat mount)
      gsap.fromTo(
        ".hero-anim",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "opacity,transform",
        }
      );

      // Hero Image subtle floating loop (tanpa menunda render awal gambar)
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          y: -8,
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    },
    { dependencies: [], scope: containerRef }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
  };

  return (
    <section
      ref={containerRef}
      id="beranda"
      className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-sky-50/30 to-background dark:from-slate-900/90 dark:via-slate-900/50 dark:to-background pt-4 pb-8 sm:pt-14 sm:pb-24 border-b border-border/60 dark:border-slate-800 transition-colors duration-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:grid lg:grid-cols-12 items-center gap-4 sm:gap-8 lg:gap-12">
          {/* 1. Image: Di Atas pada tampilan mobile (order-1), di Kanan pada desktop (lg:order-2 lg:col-span-5) */}
          <div className="order-1 lg:order-2 lg:col-span-5 w-full flex justify-center lg:justify-end">
            <div
              ref={imageRef}
              className="relative w-full max-w-[190px] sm:max-w-[280px] lg:max-w-lg"
            >
              {/* Next.js Optimized Image with High Priority Preloading & WebP Conversion */}
              <Image
                src="/assets/hero.png"
                alt="Ilustrasi Laptop dan Aplikasi AppHub"
                width={540}
                height={400}
                priority
                quality={85}
                sizes="(max-width: 640px) 190px, (max-width: 1024px) 280px, 512px"
                className="w-full h-auto object-contain drop-shadow-xl select-none"
              />
            </div>
          </div>

          {/* 2. Text & Search: Di Bawah pada tampilan mobile (order-2), di Kiri pada desktop (lg:order-1 lg:col-span-7) */}
          <div className="order-2 lg:order-1 lg:col-span-7 space-y-3 sm:space-y-6 text-center lg:text-left w-full">
            <h1 className="hero-anim text-2xl sm:text-4xl lg:text-[54px] font-black tracking-tight lg:leading-[1.18] font-display select-none py-1">
              <span className="inline-block text-3d-bubble-main">
                Temukan Aplikasi
              </span>{" "}
              <br className="hidden sm:inline" />
              <span className="inline-block text-3d-bubble-blue">
                yang Kamu Butuhkan
              </span>
            </h1>

            <p className="hero-anim max-w-xl mx-auto lg:mx-0 text-xs sm:text-base lg:text-lg text-foreground-muted dark:text-slate-300 leading-relaxed">
              Download berbagai aplikasi terbaik dengan mudah, cepat dan aman. Semua kebutuhan digitalmu ada di sini!
            </p>

            {/* Interactive Search Bar Input */}
            <form
              onSubmit={handleSubmit}
              className="hero-anim relative flex max-w-xl mx-auto lg:mx-0 items-center rounded-2xl bg-white dark:bg-slate-800 p-1.5 sm:p-2 shadow-md sm:shadow-lg shadow-blue-900/5 dark:shadow-none border border-slate-200 dark:border-slate-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-[border-color,box-shadow] duration-200"
            >
              <div className="flex items-center pl-2.5 sm:pl-3 text-slate-400 dark:text-slate-500">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari aplikasi, game, atau utilitas..."
                className="w-full bg-transparent px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="h-8 sm:h-10 px-3.5 sm:px-5 shrink-0 rounded-xl text-xs sm:text-sm"
              >
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Cari</span>
              </Button>
            </form>

            {/* Micro Trust Stats */}
            <div className="hero-anim flex flex-wrap justify-center lg:justify-start items-center gap-4 sm:gap-6 pt-1 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary dark:text-blue-400" />
                <span>Unduhan Cepat APK</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
