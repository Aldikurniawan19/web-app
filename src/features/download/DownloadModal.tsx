"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  ArrowRight,
  X,
  Smartphone,
  Star,
  HardDrive,
} from "lucide-react";
import { AppItem } from "@/types/store";
import { AppIcon } from "@/components/ui/AppIcon";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface DownloadModalProps {
  app: AppItem | null;
  isOpen: boolean;
  onClose: () => void;
}

type DownloadStage = "idle" | "preparing" | "downloading" | "verifying" | "completed";

export function DownloadModal({ app, isOpen, onClose }: DownloadModalProps) {
  const [stage, setStage] = useState<DownloadStage>("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState("0 MB/s");
  const [downloadedMb, setDownloadedMb] = useState("0");
  const [timeLeft, setTimeLeft] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Circle progress calculation (radius = 36, circumference = 2 * PI * 36 = 226.19)
  const circleRadius = 36;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (downloadProgress / 100) * circumference;

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStage("idle");
      setDownloadProgress(0);
      setDownloadSpeed("0 MB/s");
      setDownloadedMb("0");
      setTimeLeft("");
    }
  }, [isOpen]);

  if (!app) return null;

  const totalMb = parseFloat(app.fileSize.replace(/[^0-9.]/g, "")) || 20.0;
  const getInstallerName = () => `${app.id}-v${app.version}.apk`;

  const handleStartDownload = () => {
    if (stage !== "idle" && stage !== "completed") return;

    setStage("preparing");
    setDownloadProgress(0);
    setDownloadedMb("0.0");

    // Stage 1: Preparing (Play Store "Menunggu download...")
    setTimeout(() => {
      setStage("downloading");

      let currentProgress = 0;
      intervalRef.current = setInterval(() => {
        const step = Math.random() * 7 + 5;
        currentProgress += step;

        if (currentProgress >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setDownloadProgress(100);
          setDownloadedMb(totalMb.toFixed(1));
          setStage("verifying");

          // Stage 3: Verifying (Play Store "Menginstal...")
          setTimeout(() => {
            setStage("completed");

            // Trigger actual download
            const link = document.createElement("a");
            link.href = "/downloads/aerosync-v2.4.0-release.apk";
            link.download = getInstallerName();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 700);
        } else {
          setDownloadProgress(Math.floor(currentProgress));
          const currentMb = ((currentProgress / 100) * totalMb).toFixed(1);
          setDownloadedMb(currentMb);

          const speed = (Math.random() * 3.2 + 4.5).toFixed(1);
          setDownloadSpeed(`${speed} MB/s`);

          const remainingSeconds = Math.max(
            1,
            Math.ceil(((100 - currentProgress) / 100) * 3)
          );
          setTimeLeft(`~${remainingSeconds} dtk lagi`);
        }
      }, 150);
    }, 600);
  };

  const handleCancel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStage("idle");
    setDownloadProgress(0);
  };

  const handleGoToGuide = () => {
    onClose();
    setTimeout(() => {
      const element = document.getElementById("panduan-apk");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Play Store Style"
      className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-foreground"
    >
      <div className="space-y-6">
        {/* Play Store Header with Circular Progress Ring around App Icon */}
        <div className="flex items-start gap-4">
          {/* Circular Progress App Icon Container */}
          <div className="relative flex-shrink-0 flex items-center justify-center h-20 w-20">
            {/* SVG Circular Progress Ring */}
            <svg
              className={cn(
                "absolute inset-0 h-20 w-20 pointer-events-none transition-transform duration-300",
                stage === "preparing" && "animate-spin"
              )}
              viewBox="0 0 80 80"
            >
              {/* Track Ring */}
              <circle
                cx="40"
                cy="40"
                r={circleRadius}
                fill="transparent"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="3.5"
              />

              {/* Active Progress Fill Ring */}
              {(stage === "downloading" || stage === "verifying" || stage === "completed") && (
                <circle
                  cx="40"
                  cy="40"
                  r={circleRadius}
                  fill="transparent"
                  className={cn(
                    "transition-all duration-200 ease-out",
                    stage === "completed"
                      ? "stroke-emerald-500"
                      : "stroke-emerald-600 dark:stroke-emerald-400"
                  )}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 40 40)"
                />
              )}

              {/* Indeterminate Preparing Ring */}
              {stage === "preparing" && (
                <circle
                  cx="40"
                  cy="40"
                  r={circleRadius}
                  fill="transparent"
                  className="stroke-emerald-600 dark:stroke-emerald-400"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="60 166.19"
                  transform="rotate(-90 40 40)"
                />
              )}
            </svg>

            {/* App Icon Centered inside Progress Ring (Fully Circular) */}
            <div className="relative z-10 flex items-center justify-center">
              <AppIcon
                type={app.iconType}
                colorClass={app.iconColor}
                size="md"
                className="h-14 w-14 !rounded-full shadow-sm"
              />
            </div>

            {/* Completed Badge Indicator */}
            {stage === "completed" && (
              <div className="absolute -bottom-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md animate-in zoom-in-75">
                <CheckCircle2 className="h-4 w-4" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* App Title & Dynamic Play Store Status */}
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display truncate leading-tight">
              {app.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {app.developer}
            </p>

            {/* Dynamic Status Line */}
            <div className="mt-1.5">
              {stage === "idle" && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{app.fileSize}</span>
                  <span>•</span>
                  <div className="flex items-center gap-0.5 text-amber-500 font-medium">
                    <Star className="h-3 w-3 fill-amber-500" />
                    <span>{app.rating}</span>
                  </div>
                  <span>•</span>
                  <span>Android 7.0+</span>
                </div>
              )}

              {stage === "preparing" && (
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
                  Menunggu download...
                </div>
              )}

              {stage === "downloading" && (
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {downloadedMb} MB / {totalMb} MB ({downloadProgress}%)
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {downloadSpeed} • {timeLeft}
                  </div>
                </div>
              )}

              {stage === "verifying" && (
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 animate-bounce" />
                  <span>Memverifikasi paket APK...</span>
                </div>
              )}

              {stage === "completed" && (
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Download selesai • Siap dipasang</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Play Store Interactive Action Controls */}
        <div>
          {/* Idle State: Install Button */}
          {stage === "idle" && (
            <button
              type="button"
              onClick={handleStartDownload}
              className="w-full h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 select-none"
            >
              <Download className="h-4 w-4" />
              <span>Install APK ({app.fileSize})</span>
            </button>
          )}

          {/* In-Progress State: Cancel Button */}
          {(stage === "preparing" || stage === "downloading" || stage === "verifying") && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full h-10 rounded-full border border-slate-300 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="h-4 w-4" />
                <span>Batalkan</span>
              </button>
            </div>
          )}

          {/* Completed State: Open Guide Button */}
          {stage === "completed" && (
            <div className="animate-in fade-in">
              <button
                type="button"
                onClick={handleGoToGuide}
                className="w-full h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 select-none"
              >
                <BookOpen className="h-4 w-4" />
                <span>Buka Panduan Pasang APK</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          Paket: {getInstallerName()}
        </p>
      </div>
    </Modal>
  );
}
