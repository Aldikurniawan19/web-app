"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/Carousel";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { PhoneMockupPreview } from "@/features/hero/PhoneMockupPreview";
import { APP_STORE_ITEMS } from "@/constants/app-store-data";
import { AppItem } from "@/types/store";
import { cn } from "@/lib/utils";

const STICKY_NAVBAR_OFFSET_PX = 64;
const MAX_SHOWCASE_APPS = 6;
const MAX_BADGE_ICONS = 4;
const DEFAULT_AUTOPLAY_DELAY_MS = 2800;

interface StoreHeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: () => void;
  apps?: AppItem[];
  totalAppsCount?: number;
  totalWebProjectsCount?: number;
  isLoading?: boolean;
  onSelectApp?: (app: AppItem) => void;
  onDownloadApp?: (app: AppItem) => void;
  onExploreCatalog?: () => void;
  onOpenGuide?: () => void;
  autoplayDelay?: number;
}

/**
 * Scroll halus ke target section dengan memperhitungkan tinggi navbar sticky.
 */
function scrollToSection(sectionId: string) {
  if (typeof window === "undefined") return;
  const target = document.getElementById(sectionId);
  if (!target) return;

  const top =
    target.getBoundingClientRect().top + window.scrollY - STICKY_NAVBAR_OFFSET_PX;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

/**
 * Hero Section halaman beranda AllProjects bergaya centered flagship:
 * - Bagian atas: atmosfer langit lembut, badge sosial, judul 2-nada, deskripsi, dan CTA pill.
 * - Komponen handphone utama membelah batas antara area hero (setengah atas)
 *   dan area bawah (setengah bawah beserta strip pilihan aplikasi).
 */
export function StoreHero({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  apps = [],
  totalAppsCount,
  totalWebProjectsCount,
  isLoading = false,
  onSelectApp,
  onDownloadApp,
  onExploreCatalog,
  autoplayDelay = DEFAULT_AUTOPLAY_DELAY_MS,
}: StoreHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Prioritaskan aplikasi yang sudah memiliki tangkapan layar unggahan agar langsung tampil di ponsel
  const showcaseApps = useMemo(() => {
    const source = apps.length > 0 ? apps : APP_STORE_ITEMS;
    const withScreenshots = source.filter(
      (app) =>
        Array.isArray(app.screenshots) &&
        app.screenshots.some(
          (sc) =>
            Boolean(sc) &&
            typeof sc.imageUrl === "string" &&
            sc.imageUrl.trim().length > 0
        )
    );
    const withoutScreenshots = source.filter(
      (app) => !withScreenshots.includes(app)
    );
    return [...withScreenshots, ...withoutScreenshots].slice(
      0,
      MAX_SHOWCASE_APPS
    );
  }, [apps]);

  const badgeApps = useMemo(
    () => showcaseApps.slice(0, MAX_BADGE_ICONS),
    [showcaseApps]
  );

  // Sinkronkan carousel handphone utama dengan strip pilihan aplikasi di bawahnya
  useEffect(() => {
    const apis = [mainApi, thumbApi];
    const cleanups: Array<() => void> = [];

    apis.forEach((api) => {
      if (!api) return;

      const onSelect = () => {
        const selectedIndex = api.selectedScrollSnap();
        setCurrent(selectedIndex);
        apis.forEach((other) => {
          if (other && other !== api) {
            other.scrollTo(selectedIndex);
          }
        });
      };

      api.on("select", onSelect);
      api.on("reInit", onSelect);
      cleanups.push(() => {
        api.off("select", onSelect);
        api.off("reInit", onSelect);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [mainApi, thumbApi]);

  const handleThumbClick = useCallback(
    (index: number) => {
      mainApi?.scrollTo(index);
    },
    [mainApi]
  );

  useGSAP(
    () => {
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      gsap.fromTo(
        ".hero-anim",
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "opacity,transform",
        }
      );
    },
    { dependencies: [], scope: containerRef }
  );

  // Pintasan "/" membuka dan memfokuskan pencarian
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isEditable =
        activeTag === "input" ||
        activeTag === "textarea" ||
        activeTag === "select" ||
        document.activeElement?.getAttribute("contenteditable") === "true";

      if (isEditable) return;

      event.preventDefault();
      setIsSearchOpen(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 20);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Buka otomatis kotak pencarian jika ada query aktif
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearchOpen(true);
    }
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      scrollToSection("katalog");
    }
  };

  const handleExploreCatalog = () => {
    if (onExploreCatalog) {
      onExploreCatalog();
    } else {
      scrollToSection("katalog");
    }
  };

  const handleToggleSearch = () => {
    setIsSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 20);
      }
      return next;
    });
  };

  const resolvedAppsCount = totalAppsCount ?? apps.length;
  const resolvedWebCount = totalWebProjectsCount ?? 0;
  const hasCatalogCounts =
    !isLoading && (resolvedAppsCount > 0 || resolvedWebCount > 0);

  return (
    <section
      ref={containerRef}
      id="beranda"
      aria-labelledby="hero-heading"
      className="relative -mt-16 pt-16 overflow-x-clip bg-background transition-colors duration-200"
    >
      {/* Latar Atmosferik Halus di Bagian Atas Hero (Memudar Mulus ke bg-background) */}
      <div
        aria-hidden="true"
        className="hero-sky-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[620px]"
      />

      {/* Bagian Atas Hero: Centered Minimalist Header */}
      <div className="relative mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-14 text-center">
        {/* Top Social-Proof / Studio Pill Badge */}
        <div className="hero-anim flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs shadow-sm">
            <div className="flex items-center -space-x-1.5">
              {badgeApps.map((app) => (
                <AppIcon
                  key={`badge-${app.id}`}
                  type={app.iconType}
                  iconUrl={app.iconUrl}
                  colorClass={app.iconColor}
                  size="sm"
                  alt=""
                  className={cn(
                    "h-6 w-6 rounded-full ring-2 ring-surface",
                    !app.iconUrl && "p-1.5 [&_svg]:h-3 [&_svg]:w-3"
                  )}
                />
              ))}
            </div>
            <span className="text-foreground-muted">
              {hasCatalogCounts ? (
                <>
                  Jelajahi{" "}
                  <strong className="font-semibold text-foreground">
                    {resolvedAppsCount} Aplikasi
                  </strong>{" "}
                  &amp; {resolvedWebCount} Projek Web
                </>
              ) : (
                <>
                  Katalog Resmi{" "}
                  <strong className="font-semibold text-foreground">
                    AllProjects
                  </strong>{" "}
                  APK &amp; Web
                </>
              )}
            </span>
          </div>
        </div>

        {/* Judul 2-Nada Centered */}
        <h1
          id="hero-heading"
          className="hero-anim mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[56px] lg:leading-[1.08]"
        >
          <span className="block">Pusat Aplikasi</span>
          <span className="block text-foreground-muted">
            Android &amp; Projek Web.
          </span>
        </h1>

        {/* Subjudul Singkat Centered */}
        <p className="hero-anim mx-auto mt-4 max-w-lg text-sm leading-relaxed text-foreground-muted sm:text-base">
          Unduh berkas APK terverifikasi dengan riwayat versi rapi, serta
          jelajahi koleksi projek web modern dalam satu platform.
        </p>

        {/* CTA Utama + Tombol Pencarian Ringkas */}
        <div className="hero-anim mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleExploreCatalog}
            className="group rounded-2xl px-7"
          >
            <span>Jelajahi Katalog</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleToggleSearch}
            aria-expanded={isSearchOpen}
            aria-label="Buka kotak pencarian aplikasi"
            className={cn(
              "rounded-2xl px-4",
              isSearchOpen && "border-primary text-primary"
            )}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cari</span>
          </Button>
        </div>

        {/* Input Pencarian Opsional yang Dapat Dibuka Kapan Saja */}
        {isSearchOpen && (
          <form
            onSubmit={handleSubmit}
            role="search"
            aria-label="Cari aplikasi Android atau projek web"
            className="mx-auto mt-4 flex max-w-md items-center gap-1.5 rounded-full border border-border bg-surface p-1.5 shadow-sm focus-within:border-border-focus focus-within:ring-2 focus-within:ring-accent-subtle transition-[border-color,box-shadow]"
          >
            <div className="flex items-center pl-3 text-foreground-muted">
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Cari aplikasi Android atau projek web..."
              aria-label="Kata kunci pencarian aplikasi atau projek web"
              className="w-full bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
            />

            {searchQuery.trim().length > 0 && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Hapus kata kunci pencarian"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}

            <button
              type="submit"
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cari
            </button>
          </form>
        )}
      </div>

      {/* Area Handphone Membelah Batas Hero (Menyatu Mulus dengan Bagian Bawah) */}
      <div className="hero-anim relative mt-8 sm:mt-10 w-full">
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 sm:px-6 lg:px-8">
          {/* Carousel Handphone Utama (Tidak bergeser otomatis antar aplikasi; tangkapan layar di dalamnya bergeser otomatis) */}
          <Carousel
            className="w-full max-w-sm"
            setApi={setMainApi}
            opts={{ loop: showcaseApps.length > 1 }}
            aria-label="Pratinjau layar handphone aplikasi Android"
          >
            <CarouselContent>
              {showcaseApps.map((app, index) => (
                <CarouselItem
                  key={app.id}
                  className="flex w-full items-center justify-center pt-2 pb-6"
                >
                  <PhoneMockupPreview
                    app={app}
                    isActive={current === index}
                    autoplayDelay={autoplayDelay}
                    onSelectApp={onSelectApp}
                    onDownloadApp={onDownloadApp}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Strip Pilihan Aplikasi di Bagian Bawah Tepat di Bawah Handphone */}
          <div className="mt-4 w-full max-w-3xl pb-10 sm:pb-12">
            <div className="mb-3 flex items-center justify-center gap-2 text-xs font-medium text-foreground-muted">
              <span>Pilihan Aplikasi</span>
              <span className="font-mono text-[11px] text-foreground">
                {current + 1} / {showcaseApps.length}
              </span>
            </div>

            <Carousel
              className="relative w-full"
              setApi={setThumbApi}
              opts={{
                loop: showcaseApps.length > 4,
                align: showcaseApps.length > 4 ? "center" : "start",
              }}
              aria-label="Pilih pratinjau aplikasi pada handphone"
            >
              {/* Gradient Fade Kiri & Kanan hanya saat daftar dapat digeser */}
              {showcaseApps.length > 4 && (
                <>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 sm:w-16 bg-gradient-to-r from-background to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 sm:w-16 bg-gradient-to-l from-background to-transparent"
                  />
                </>
              )}

              <CarouselContent
                className={cn(
                  "my-1 flex items-end",
                  showcaseApps.length <= 4 && "ml-0 justify-center gap-2 sm:gap-5"
                )}
              >
                {showcaseApps.map((app, index) => (
                  <CarouselItem
                    key={`thumb-${app.id}`}
                    className={cn(
                      showcaseApps.length <= 4
                        ? "pl-0 basis-auto w-[96px] sm:w-[140px]"
                        : "basis-1/3 sm:basis-1/4 md:basis-1/5"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleThumbClick(index)}
                      title={app.name}
                      aria-label={`Tampilkan ${app.name} di pratinjau handphone`}
                      aria-pressed={current === index}
                      className="group relative flex h-[104px] sm:h-[112px] w-full cursor-pointer items-center justify-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {/* Bingkai Kartu Miring SVG */}
                      <div
                        className={cn(
                          "pointer-events-none absolute bottom-0 z-0 transition-colors duration-200",
                          current === index
                            ? "text-primary"
                            : "text-border group-hover:text-border-subtle"
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 161 92"
                          fill="none"
                          aria-hidden="true"
                          className="h-auto w-[96px] sm:w-[128px]"
                        >
                          <path
                            d="M0.682517 80.6118L0.501193 39.6946C0.480127 34.9409 3.80852 30.8294 8.46241 29.8603L148.426 0.713985C154.636 -0.579105 160.465 4.16121 160.465 10.504V80.7397C160.465 86.2674 155.98 90.7465 150.453 90.7397L10.6701 90.5674C5.16936 90.5607 0.706893 86.1125 0.682517 80.6118Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>

                      {/* Logo / Ikon Aplikasi */}
                      <AppIcon
                        type={app.iconType}
                        iconUrl={app.iconUrl}
                        colorClass={app.iconColor}
                        size="lg"
                        alt={`Logo ${app.name}`}
                        className={cn(
                          "relative z-10 h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-2xl shadow-lg transition-all duration-200",
                          !app.iconUrl && "p-3.5",
                          current === index
                            ? "-translate-y-1.5 scale-105 ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "opacity-85 group-hover:opacity-100 group-hover:-translate-y-1"
                        )}
                      />
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
