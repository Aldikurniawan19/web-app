import type { Metadata } from "next";
import { AppStorageService } from "@/services/app-storage.service";
import { WebProjectService } from "@/services/web-project.service";
import { ApkSecurityService } from "@/services/apk-security.service";
import { pickFeaturedSecurityApp } from "@/lib/security-format";
import {
  buildSeoKeywords,
  getSiteUrl,
  SITE_ALTERNATE_NAMES,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-seo";
import { HomeCatalogClient } from "@/features/home/HomeCatalogClient";
import type { AppItem } from "@/types/store";
import type { WebProjectItem } from "@/types/web-project";
import type { ApkSecurityReportDetail } from "@/types/security";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  let dynamicKeywords: string[] = [];
  let appsCount = 0;
  let webCount = 0;

  try {
    const [apps, webProjects] = await Promise.all([
      AppStorageService.getPublicCatalogApps(),
      WebProjectService.getPublicWebProjects(),
    ]);
    appsCount = apps.length;
    webCount = webProjects.length;

    const appTerms = apps.flatMap((app) => [
      app.name,
      `${app.name} apk`,
      `download ${app.name}`,
      `${app.name} android`,
      app.category,
    ]);
    const webTerms = webProjects.flatMap((proj) => [
      proj.name,
      proj.category || "Projek Web",
      ...proj.technologies.slice(0, 3),
    ]);
    dynamicKeywords = [...appTerms, ...webTerms];
  } catch {
    // Gunakan kata kunci dasar bila database tidak terjangkau saat build
  }

  const countText =
    appsCount > 0 || webCount > 0
      ? `Jelajahi ${appsCount} aplikasi Android APK dan ${webCount} projek web modern di `
      : "Temukan dan unduh aplikasi Android APK gratis bebas virus serta koleksi projek web modern di ";

  const description = `${countText}AllProjects (AlllProjek / AllProjek) — terverifikasi VirusTotal dengan riwayat versi rapi dan panduan instalasi lengkap.`;

  return {
    title: {
      absolute:
        "AllProjects (AlllProjek) — Pusat Aplikasi Android APK Aman & Projek Web",
    },
    description,
    keywords: buildSeoKeywords(dynamicKeywords),
    alternates: {
      canonical: "/",
      languages: {
        "id-ID": "/",
      },
    },
    openGraph: {
      title: "AllProjects (AlllProjek) — Pusat Aplikasi Android APK Aman & Projek Web",
      description,
      url: SITE_URL,
    },
  };
}

export default async function AppHubPage() {
  let initialApps: AppItem[] = [];
  let initialWebProjects: WebProjectItem[] = [];
  let initialSecurityDetail: ApkSecurityReportDetail | null = null;
  let hasServerData = false;

  try {
    [initialApps, initialWebProjects] = await Promise.all([
      AppStorageService.getPublicCatalogApps(),
      WebProjectService.getPublicWebProjects(),
    ]);
    hasServerData = initialApps.length > 0 || initialWebProjects.length > 0;

    const featuredApp = pickFeaturedSecurityApp(initialApps);
    if (featuredApp) {
      initialSecurityDetail = await ApkSecurityService.getSecurityReport(
        featuredApp.id,
        featuredApp.version,
        { syncPending: false }
      );
    }
  } catch (error) {
    console.warn(
      "[AppHubPage] Katalog awal di server belum tersedia sementara:",
      error instanceof Error ? error.message : String(error)
    );
  }

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: "AllProjects (AlllProjek) — Pusat Aplikasi Android APK & Projek Web",
        alternateName: [...SITE_ALTERNATE_NAMES],
        description:
          "Katalog aplikasi Android APK terverifikasi bebas virus VirusTotal dan projek web modern di AllProjects (alllprojects.my.id).",
        inLanguage: "id-ID",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "ItemList",
        name: `Daftar Aplikasi Android & Projek Web ${SITE_NAME}`,
        numberOfItems: initialApps.length + initialWebProjects.length,
        itemListElement: [
          ...initialApps.slice(0, 12).map((app, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "SoftwareApplication",
              name: app.name,
              description: app.description,
              operatingSystem: "Android",
              applicationCategory: app.category || "UtilitiesApplication",
              softwareVersion: app.version,
              fileSize: app.fileSize,
              url: getSiteUrl("/aplikasi"),
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "IDR",
              },
            },
          })),
          ...initialWebProjects.slice(0, 8).map((proj, index) => ({
            "@type": "ListItem",
            position: initialApps.slice(0, 12).length + index + 1,
            item: {
              "@type": "WebApplication",
              name: proj.name,
              description: proj.description,
              applicationCategory: proj.category || "WebApplication",
              url: proj.liveUrl || getSiteUrl("/projek-web"),
            },
          })),
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Apakah file APK di AllProjects (AlllProjek) aman dan bebas virus?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Ya. Setiap berkas APK diperiksa menggunakan multi-mesin antivirus VirusTotal API v3 dan diverifikasi sidik jari SHA-256 sebelum dipublikasikan ke katalog AllProjects.",
            },
          },
          {
            "@type": "Question",
            name: "Bagaimana cara memasang berkas APK dari AllProjects di ponsel Android?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Unduh berkas APK dari katalog, aktifkan izin Instal aplikasi tidak dikenal pada browser atau pengelola berkas Android, ketuk berkas APK yang telah diunduh, lalu pilih Instal.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <HomeCatalogClient
        initialApps={initialApps}
        initialWebProjects={initialWebProjects}
        initialSecurityDetail={initialSecurityDetail}
        hasServerData={hasServerData}
      />
    </>
  );
}
