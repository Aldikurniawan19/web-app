"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, Smartphone, Copy, Check, Download } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { APP_CONFIG } from "@/constants/app-data";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QrCodeModal({ isOpen, onClose }: QrCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const currentOrigin =
        typeof window !== "undefined" ? window.location.origin : "https://aerosync.app";
      const fullDownloadUrl = `${currentOrigin}${APP_CONFIG.downloadApkUrl}`;

      QRCode.toDataURL(fullDownloadUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#090d16",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Gagal generate QR", err));
    }
  }, [isOpen]);

  const handleCopyLink = () => {
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : "https://aerosync.app";
    const fullDownloadUrl = `${currentOrigin}${APP_CONFIG.downloadApkUrl}`;
    navigator.clipboard.writeText(fullDownloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pindai QR untuk Unduh di Ponsel"
      description="Arahkan kamera ponsel Android Anda ke kode QR berikut untuk langsung memulai pengunduhan berkas APK."
    >
      <div className="flex flex-col items-center">
        {/* QR Code Container */}
        <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-white p-3 shadow-inner border border-border">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR Code Unduhan APK AeroSync"
              className="h-full w-full object-contain rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-foreground-muted">
              <QrCode className="h-10 w-10 animate-pulse text-primary" />
              <span className="text-xs">Menyiapkan kode QR...</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-5 w-full space-y-2 rounded-lg bg-surface-card p-3 text-xs text-foreground-muted border border-border">
          <div className="flex justify-between">
            <span>Berkas:</span>
            <span className="font-mono text-foreground font-medium">
              aerosync-{APP_CONFIG.currentVersion}.apk
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ukuran:</span>
            <span className="text-foreground font-medium">{APP_CONFIG.fileSize}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex w-full gap-3">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                <span className="text-success">Tautan Disalin</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Salin Tautan</span>
              </>
            )}
          </Button>

          <a
            href={APP_CONFIG.downloadApkUrl}
            download
            className="w-full"
          >
            <Button variant="primary" size="sm" fullWidth>
              <Download className="h-4 w-4" />
              <span>Unduh Langsung</span>
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}
