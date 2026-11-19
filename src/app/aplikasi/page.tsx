import type { Metadata } from "next";
import { AppStorageService } from "@/services/app-storage.service";
import { AllAppsPageClient } from "@/features/catalog/AllAppsPageClient";
import { buildSeoKeywords, getSiteUrl, SITE_URL } from "@/lib/site-seo";
import type { AppItem } from "@/types/store";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  let appKeywords: string[] = [];
  let count = 0;

  try {
    const apps = await AppStorageService.getPublicCatalogApps();
    count = apps.length;
    appKeywords = apps.flatMap((app) => [
      app.name,
      `${app.name} apk`,
      `download ${app.name}`,
      app.category,
    ]);
  } catch {
    // Gunakan kata kunci dasar bila database belum terjangkau
  }

  const description =
    count > 0
      ? `Unduh ${count} aplikasi Android APK gratis dan aman bebas virus di katalog resmi alllprojects. Lengkap dengan riwayat versi dan verifikasi VirusTotal.`
      : "Daftar lengkap aplikasi Android APK gratis dan aman bebas virus di katalog resmi alllprojects dengan verifikasi VirusTotal.";

  return {
    title: "Katalog Aplikasi Android APK Gratis & Bebas Virus",
    description,
    keywords: buildSeoKeywords([
      "katalog aplikasi android",
      "daftar apk gratis",
      "download apk android aman",
      "alllprojects aplikasi",
      "alllprojek aplikasi",
      "allprojek apk",
      ...appKeywords,
    ]),
    alternates: {
      canonical: "/aplikasi",
      languages: {
        "id-ID": "/aplikasi",
      },
    },
    openGraph: {
      title: "Katalog Aplikasi Android APK Gratis & Bebas Virus | alllprojects",
      description,
      url: getSiteUrl("/aplikasi"),
    },
  };
}

export default async function AllAppsPage() {
  let initialApps: AppItem[] = [];
  let hasServerData = false;

  try {
    initialApps = await AppStorageService.getPublicCatalogApps();
    hasServerData = initialApps.length > 0;
  } catch (error) {
    console.error("[AllAppsPage] Gagal memuat daftar aplikasi di server:", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        url: getSiteUrl("/aplikasi"),
        name: "Katalog Aplikasi Android APK — alllprojects",
        description:
          "Katalog lengkap paket aplikasi Android APK terverifikasi VirusTotal di alllprojects.",
        inLanguage: "id-ID",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Katalog Aplikasi",
            item: getSiteUrl("/aplikasi"),
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "Daftar Aplikasi Android alllprojects",
        numberOfItems: initialApps.length,
        itemListElement: initialApps.slice(0, 20).map((app, index) => ({
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
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "IDR",
            },
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AllAppsPageClient initialApps={initialApps} hasServerData={hasServerData} />
    </>
  );
}
