"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { AppItem } from "@/types/store";
import { cn } from "@/lib/utils";
import gsap from "gsap";

export interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  app?: AppItem | null;
}

interface StepItem {
  number: number;
  title: string;
  description: string;
}

const INSTALL_STEPS: StepItem[] = [
  {
    number: 1,
    title: "Unduh Berkas APK",
    description:
      "Berkas installer resmi (.apk) akan tersimpan secara otomatis di folder Download penyimpanan perangkat Anda.",
  },
  {
    number: 2,
    title: "Izinkan Sumber Tidak Dikenal",
    description:
      "Jika muncul peringatan sistem Android, buka Pengaturan -> Keamanan -> pilih browser atau File Manager Anda, lalu aktifkan izin 'Instal aplikasi tidak dikenal'.",
  },
  {
    number: 3,
    title: "Buka & Pasang Berkas",
    description:
      "Buka berkas .apk melalui panel notifikasi atau aplikasi Pengelola Berkas (File Manager), kemudian ketuk tombol 'Instal'.",
  },
  {
    number: 4,
    title: "Selesai & Jalankan Aplikasi",
    description:
      "Setelah proses instalasi selesai, tekan tombol 'Buka'. Aplikasi siap digunakan secara aman dan lancar.",
  },
];

export function InstallGuideModal({
  isOpen,
  onClose,
  app,
}: InstallGuideModalProps) {
  const [isUnderstood, setIsUnderstood] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const checkboxContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsUnderstood(false);
      document.body.style.overflow = "hidden";

      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: "power2.out" }
        );
      }
      if (dialogRef.current) {
        gsap.fromTo(
          dialogRef.current,
          { opacity: 0, scale: 0.95, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "power3.out" }
        );
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    // Memberikan feedback getar lembut pada area checkbox jika pengguna mencoba klik di luar modal
    if (!isUnderstood && checkboxContainerRef.current) {
      gsap.fromTo(
        checkboxContainerRef.current,
        { x: -5 },
        {
          x: 5,
          duration: 0.07,
          repeat: 3,
          yoyo: true,
          ease: "power1.inOut",
          onComplete: () => {
            gsap.to(checkboxContainerRef.current, { x: 0, duration: 0.07 });
          },
        }
      );
    }
  };

  const handleButtonClick = () => {
    if (!isUnderstood) {
      if (checkboxContainerRef.current) {
        gsap.fromTo(
          checkboxContainerRef.current,
          { x: -5 },
          {
            x: 5,
            duration: 0.07,
            repeat: 3,
            yoyo: true,
            ease: "power1.inOut",
            onComplete: () => {
              gsap.to(checkboxContainerRef.current, { x: 0, duration: 0.07 });
            },
          }
        );
      }
      return;
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-canvas-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop (Tanpa opsi tutup sebelum dicentang) */}
      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Clean Canvas Modal Dialog Box */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6 select-none my-auto"
      >
        {/* Simple Header */}
        <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <h2
            id="guide-canvas-title"
            className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight"
          >
            Panduan Instalasi APK
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {app
              ? `Langkah memasang ${app.name} di perangkat Android Anda:`
              : "Ikuti langkah praktis berikut untuk memasang aplikasi:"}
          </p>
        </div>

        {/* Clean Sequential Steps (1, 2, 3, 4) */}
        <div className="space-y-4">
          {INSTALL_STEPS.map((step, idx) => (
            <div key={step.number} className="flex items-start gap-3.5 sm:gap-4">
              {/* Step Number Circle */}
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900/60 text-primary dark:text-blue-400 font-bold text-xs sm:text-sm font-mono mt-0.5">
                {step.number}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Interactive Checkbox & Action Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
          {/* Interactive Checkbox */}
          <div
            ref={checkboxContainerRef}
            onClick={() => setIsUnderstood(!isUnderstood)}
            className="flex items-center gap-3 cursor-pointer rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-150",
                isUnderstood
                  ? "bg-primary border-primary text-white shadow-xs"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              )}
            >
              {isUnderstood && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              Saya sudah paham panduan ini
            </span>
          </div>

          {/* Action Button: Disabled & Not-Allowed on hover when unchecked */}
          <button
            type="button"
            onClick={handleButtonClick}
            className={cn(
              "w-full h-11 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 select-none",
              isUnderstood
                ? "cursor-pointer bg-gradient-to-b from-blue-500 via-primary to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_3px_0_#1d4ed8,0_4px_8px_rgba(37,99,235,0.25)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_0_#1d4ed8,0_6px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#1d4ed8]"
                : "cursor-not-allowed opacity-50 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 shadow-none hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-400 dark:hover:text-slate-500"
            )}
            title={
              isUnderstood
                ? "Tutup panduan dan lanjutkan"
                : "Silakan centang persetujuan terlebih dahulu"
            }
          >
            <Check className="h-4 w-4" />
            <span>Saya Sudah Paham & Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
