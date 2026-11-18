import type { ApkSecuritySummary, SecurityEngineHighlight } from "@/types/security";
import type { AppItem } from "@/types/store";

/**
 * Memilih satu aplikasi contoh terbaik untuk ditampilkan pada section transparansi keamanan.
 */
export function pickFeaturedSecurityApp(apps: AppItem[]): AppItem | null {
  if (apps.length === 0) return null;
  return (
    apps.find((app) => app.securityScan?.status === "clean") ||
    apps.find((app) => Boolean(app.securityScan)) ||
    apps[0]
  );
}

export interface SecurityStatusPresentation {
  label: string;
  headline: string;
  summaryText: string;
  badgeClass: string;
  panelClass: string;
  iconClass: string;
}

/**
 * Memformat tanggal pemindaian ISO menjadi format tanggal Indonesia yang mudah dibaca.
 */
export function formatScanDate(iso?: string): string {
  if (!iso) return "Baru saja";
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Mengembalikan teks dan kelas token desain yang konsisten untuk status keamanan APK.
 */
export function getSecurityStatusPresentation(
  scan?: ApkSecuritySummary | null,
  fallbackVersion?: string
): SecurityStatusPresentation {
  const ver = scan?.version || fallbackVersion || "terbaru";

  if (!scan || scan.status === "failed") {
    return {
      label: "Belum Dipindai",
      headline: "Belum Ada Hasil Pemindaian Virus",
      summaryText: `Berkas APK untuk versi v${ver} belum memiliki laporan pemindaian VirusTotal.`,
      badgeClass: "border-border bg-background-soft text-foreground-muted",
      panelClass: "border-border bg-background-soft",
      iconClass: "text-foreground-subtle",
    };
  }

  if (scan.status === "pending") {
    return {
      label: "Sedang Dipindai",
      headline: "Pemeriksaan Keamanan Sedang Diproses",
      summaryText:
        "Berkas APK sedang dianalisis oleh mesin antivirus VirusTotal. Muat ulang status beberapa saat lagi.",
      badgeClass: "border-amber-200 bg-warning-subtle text-amber-800",
      panelClass: "border-amber-200 bg-amber-50/70",
      iconClass: "text-amber-600",
    };
  }

  if (scan.status === "malicious" || scan.status === "suspicious") {
    const flaggedCount = scan.maliciousCount + scan.suspiciousCount;
    return {
      label: scan.status === "malicious" ? "Terdeteksi Ancaman" : "Perlu Peninjauan",
      headline: "Ditemukan Peringatan pada Pemindaian",
      summaryText: `${flaggedCount} dari ${scan.totalEngines} mesin keamanan menandai berkas v${ver}. Tinjau laporan resmi sebelum memasang.`,
      badgeClass: "border-rose-200 bg-danger-subtle text-rose-800",
      panelClass: "border-rose-200 bg-rose-50/70",
      iconClass: "text-rose-600",
    };
  }

  return {
    label: "Bebas Virus",
    headline: "Terverifikasi Bebas Virus & Malware",
    summaryText: `0 dari ${scan.totalEngines} mesin antivirus mendeteksi ancaman pada APK versi v${ver}.`,
    badgeClass: "border-emerald-200 bg-success-subtle text-emerald-800",
    panelClass: "border-emerald-200 bg-emerald-50/70",
    iconClass: "text-emerald-600",
  };
}

/**
 * Mengubah kategori hasil vendor antivirus menjadi label bahasa Indonesia yang jelas.
 */
export function getEngineCategoryLabel(
  category: SecurityEngineHighlight["category"]
): { label: string; isSafe: boolean } {
  if (category === "malicious") {
    return { label: "Terdeteksi", isSafe: false };
  }
  if (category === "suspicious") {
    return { label: "Mencurigakan", isSafe: false };
  }
  return { label: "Aman", isSafe: true };
}
