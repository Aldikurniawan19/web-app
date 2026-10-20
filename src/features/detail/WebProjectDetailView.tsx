"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Code2,
  Sparkles,
  Check,
  Zap,
  Layout,
  GitBranch,
  Home,
} from "lucide-react";
import { WebProjectItem } from "@/types/web-project";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface WebProjectDetailViewProps {
  project: WebProjectItem;
  onBack: () => void;
  breadcrumbs?: BreadcrumbItem[];
}

export function WebProjectDetailView({
  project,
  onBack,
  breadcrumbs,
}: WebProjectDetailViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<
    "tentang" | "teknologi" | "fitur" | "informasi"
  >("tentang");

  useEffect(() => {
    setActiveTab("tentang");
  }, [project.id]);

  useGSAP(
    () => {
      gsap.fromTo(
        ".detail-anim",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    },
    { dependencies: [project.id], scope: containerRef }
  );

  const tabs = [
    { id: "tentang", label: "Tentang Projek" },
    { id: "teknologi", label: "Teknologi & Stack" },
    { id: "fitur", label: "Fitur Unggulan" },
    { id: "informasi", label: "Informasi & Tautan" },
  ] as const;

  const handleBackWithAnimation = (action?: () => void) => {
    const animEls = containerRef.current?.querySelectorAll(".detail-anim");
    if (animEls && animEls.length > 0) {
      gsap.to(animEls, {
        opacity: 0,
        y: 15,
        duration: 0.22,
        stagger: 0.02,
        ease: "power2.in",
        onComplete: action || onBack,
      });
    } else {
      if (action) {
        action();
      } else {
        onBack();
      }
    }
  };

  const defaultBreadcrumbs: BreadcrumbItem[] = [
    {
      label: "Beranda",
      icon: Home,
      onClick: () => handleBackWithAnimation(),
    },
    {
      label: `Detail ${project.name}`,
      isCurrent: true,
    },
  ];

  const resolvedBreadcrumbs: BreadcrumbItem[] =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs.map((bc) => ({
          ...bc,
          onClick: bc.onClick ? () => handleBackWithAnimation(bc.onClick) : undefined,
        }))
      : defaultBreadcrumbs;

  return (
    <div ref={containerRef} className="py-8 sm:py-12 bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Dynamic Breadcrumb Navigation Bar (Home > [Katalog] > Detail) */}
        <div className="detail-anim">
          <Breadcrumb items={resolvedBreadcrumbs} />
        </div>

        {/* Main Project Hero Header Card */}
        <div className="detail-anim rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm transition-colors duration-200">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Left Col: Web Icon & Info */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row gap-5 items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                <Globe className="h-10 w-10" />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display select-none py-0.5">
                    {project.name}
                  </h1>
                  <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-semibold text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                    {project.category || "Web App"}
                  </span>
                  {project.featured && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                      <Sparkles className="h-3 w-3" />
                      <span>Unggulan</span>
                    </span>
                  )}
                </div>

                {/* Meta Row: Technologies Count, Category, Status */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Web</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Code2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{project.technologies.length} Teknologi Terintegrasi</span>
                  </div>
                  <span>•</span>
                  <span>Kategori {project.category}</span>
                </div>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                  {project.description}
                </p>
              </div>
            </div>

            {/* Right Col: Action Buttons (Visit Website & GitHub) */}
            <div className="lg:col-span-4 flex flex-col sm:items-end gap-3 lg:pl-6 lg:border-l border-slate-100 dark:border-slate-800">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 font-bold shadow-md shadow-primary/25 rounded-2xl text-sm bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white hover:-translate-y-0.5 active:translate-y-0.5 transition-all select-none"
                >
                  <span>Kunjungi Website</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>Lihat Repository</span>
                </a>
              )}

              <span className="text-[11px] text-slate-400">
                Akses langsung tanpa perlu instalasi berkas
              </span>
            </div>
          </div>
        </div>

        {/* Large Browser Showcase Card (Tampilan Sekilas Resolusi Tinggi) */}
        <div className="detail-anim rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {/* Mockup Browser Window Header */}
          <div className="h-10 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-4 py-1 text-xs font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 max-w-sm sm:max-w-md truncate">
              <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">
                {project.liveUrl || `https://${project.id}.allprojects.dev`}
              </span>
            </div>

            <div className="w-12 text-right">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Screenshot Image Container */}
          <div className="relative aspect-[16/10] sm:aspect-[2/1] w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
            {project.imageUrl ? (
              <img
                src={project.imageUrl}
                alt={`Tampilan sekilas ${project.name}`}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-12 text-slate-400">
                <Globe className="h-16 w-16 text-primary mb-3" />
                <p className="text-sm font-bold text-foreground">
                  Foto Tampilan Sekilas Belum Diunggah
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Pengelola belum menambahkan tangkapan layar untuk projek ini.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Tabs Bar */}
        <div className="detail-anim flex items-center gap-2.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pt-2 pb-3.5 px-1.5 -mx-1.5 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 select-none",
                  isActive
                    ? "bg-gradient-to-b from-blue-500 via-primary to-blue-700 dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2.5px_0_#1d4ed8,0_3px_6px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2.5px_0_#1e3a8a] -translate-y-0.5"
                    : "border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_0_#cbd5e1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0.5"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Body Content */}
        <div key={activeTab} className="transition-opacity duration-200">
          {/* TAB 1: TENTANG */}
          {activeTab === "tentang" && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white font-display select-none py-0.5">
                    Tentang Projek Web
                  </h2>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {project.description}
                  </p>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Projek website <strong>{project.name}</strong> dibangun dengan standar rekayasa perangkat lunak modern untuk menghadirkan pengalaman pengguna yang cepat, responsif, dan mudah diakses di berbagai ukuran layar.
                  </p>

                  {/* Highlight Point Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-primary">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Performa Tinggi
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Waktu muat instan dengan arsitektur web modern.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        <Layout className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Desain Responsif
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Tampilan optimal di desktop, tablet, dan smartphone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Ringkasan Cepat */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    Ringkasan Spesifikasi Web
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-500 dark:text-slate-400">Nama Projek</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{project.name}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-500 dark:text-slate-400">Kategori</span>
                      <span className="font-semibold text-primary">{project.category}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-500 dark:text-slate-400">Tipe Aplikasi</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Web Interaktif</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-500 dark:text-slate-400">Status Rilis</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Dipublikasikan</span>
                    </div>
                  </div>

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span>Buka Halaman Web</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEKNOLOGI */}
          {activeTab === "teknologi" && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-display">
                  Teknologi & Framework yang Digunakan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kumpulan pustaka dan arsitektur yang mendukung stabilitas serta performa projek {project.name}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {project.technologies.map((tech, idx) => (
                  <div
                    key={`tech-detail-${idx}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {tech}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Komponen Inti Projek
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FITUR */}
          {activeTab === "fitur" && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-display">
                  Fitur Unggulan Projek
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kemampuan dan nilai tambah utama yang ditawarkan oleh aplikasi web ini.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Antarmuka Pengguna Modern & Responsif",
                    desc: "Tata letak dirancang agar nyaman digunakan dari layar smartphone hingga monitor desktop resolusi tinggi.",
                  },
                  {
                    title: "Navigasi Cepat & Seamless",
                    desc: "Waktu muat cepat tanpa jeda yang mengganggu kenyamanan pengguna.",
                  },
                  {
                    title: "Dukungan Mode Gelap & Terang",
                    desc: "Tampilan visual otomatis menyesuaikan preferensi tema perangkat pengguna.",
                  },
                  {
                    title: "Keamanan & Stabilitas Data",
                    desc: "Menerapkan best practice rekayasa web untuk menjaga keandalan aplikasi.",
                  },
                ].map((feat, idx) => (
                  <div
                    key={`feat-${idx}`}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {feat.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INFORMASI */}
          {activeTab === "informasi" && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-display">
                  Informasi & Tautan Terkait
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detail tautan akses publik dan informasi metadata projek web.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Tautan Live Web
                  </span>
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-primary hover:underline break-all"
                    >
                      <span>{project.liveUrl}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-xs text-slate-500">Tautan belum tersedia.</p>
                  )}
                </div>

                <div className="space-y-2 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Tautan Repository GitHub
                  </span>
                  {project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-colors break-all"
                    >
                      <GitBranch className="h-3.5 w-3.5 shrink-0" />
                      <span>{project.githubUrl}</span>
                    </a>
                  ) : (
                    <p className="text-xs text-slate-500">Repository bersifat privat.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
