/**
 * Sumber kebenaran tunggal untuk konfigurasi SEO, domain kanonis, kata kunci,
 * dan structured data halaman publik AllProjects (alllprojects.my.id).
 */

const DEFAULT_PRODUCTION_SITE_URL = "https://alllprojects.my.id";

function normalizeOrigin(raw?: string): string {
  if (!raw) return DEFAULT_PRODUCTION_SITE_URL;
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return DEFAULT_PRODUCTION_SITE_URL;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export const SITE_URL = normalizeOrigin(
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_PRODUCTION_SITE_URL
);

export const SITE_NAME = "AllProjects";
export const SITE_PUBLISHER = "AllProjects Studio";
export const SITE_FAVICON_PATH = "/assets/favicon-48.png";
export const SITE_APPLE_ICON_PATH = "/assets/apple-touch-icon.png";
export const SITE_LOGO_PATH = "/assets/og-logo.png";
export const SITE_GITHUB_URL = "https://github.com/Aldikurniawan19";

export const SITE_ALTERNATE_NAMES = [
  "AlllProjects",
  "AlllProjek",
  "AllProjek",
  "All Projek",
  "AllProject",
  "All Projects",
  "AlllProject",
  "AllProjects Indonesia",
  "AllProjects Studio",
  "alllprojects.my.id",
] as const;

export const CORE_SEO_KEYWORDS: readonly string[] = [
  // Nama brand & variasi ejaan populer yang sering diketik di Google
  "alllprojek",
  "alllprojects",
  "alllprojects.my.id",
  "allprojek",
  "all projek",
  "allprojects",
  "allproject",
  "all projects",
  "all project",
  "alllproject",
  "alllprojek apk",
  "allprojek apk",
  "allprojects apk",
  "allprojects android",
  "allprojects web",
  "allprojek web",

  // Kata kunci pencarian aplikasi Android & APK Bahasa Indonesia
  "download aplikasi android",
  "download apk",
  "download apk gratis",
  "download apk aman",
  "download apk bebas virus",
  "download apk terbaru",
  "download apk langsung",
  "unduh apk android",
  "unduh aplikasi android gratis",
  "pusat aplikasi android",
  "katalog aplikasi android",
  "katalog apk resmi",
  "aplikasi android indonesia",
  "aplikasi android gratis",
  "aplikasi android ringan",
  "aplikasi android tanpa play store",
  "apk terverifikasi virustotal",
  "cek virus apk",
  "aplikasi bebas malware",
  "cara pasang apk android",
  "cara instal file apk",

  // Kata kunci pencarian projek web & portofolio
  "projek web",
  "project web",
  "katalog projek web",
  "koleksi projek web",
  "aplikasi web modern",
  "website interaktif",
  "portofolio web developer",
  "web app indonesia",
  "contoh projek web",
  "aplikasi android dan projek web",
];

/**
 * Menggabungkan URL penuh berdasarkan SITE_URL untuk canonical, Open Graph, dan JSON-LD.
 */
export function getSiteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

/**
 * Menggabungkan dan men-deduplikasi daftar kata kunci SEO tanpa duplikat huruf besar/kecil.
 */
export function buildSeoKeywords(extraKeywords: string[] = []): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of [...CORE_SEO_KEYWORDS, ...extraKeywords]) {
    const clean = item.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(clean);
    }
  }

  return result;
}
