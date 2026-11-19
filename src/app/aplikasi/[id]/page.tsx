import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppStorageService } from "@/services/app-storage.service";
import { AppDetailPageClient } from "@/features/detail/AppDetailPageClient";
import {
  buildSeoKeywords,
  getSiteUrl,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-seo";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const entries = await AppStorageService.getPublicSitemapEntries();
    return entries.map((entry) => ({ id: entry.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const app = await AppStorageService.getPublicCatalogAppById(decodedId);

  if (!app) {
    return {
      title: "Aplikasi Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = `/aplikasi/${encodeURIComponent(app.id)}`;
  const fullUrl = getSiteUrl(canonicalPath);
  const title = `Download ${app.name} v${app.version} APK Android Gratis & Aman`;
  const description = `${app.description} Unduh ${app.name} v${app.version} (${app.fileSize}) gratis dan terverifikasi bebas virus VirusTotal di ${SITE_NAME}.`;
  const ogImage = app.iconUrl
    ? app.iconUrl.startsWith("http")
      ? app.iconUrl
      : getSiteUrl(app.iconUrl)
    : getSiteUrl(SITE_LOGO_PATH);

  return {
    title,
    description,
    keywords: buildSeoKeywords([
      app.name,
      `${app.name} apk`,
      `download ${app.name}`,
      `download ${app.name} apk`,
      `${app.name} android`,
      `${app.name} terbaru`,
      app.category,
      ...app.features.slice(0, 4),
    ]),
    alternates: {
      canonical: canonicalPath,
      languages: {
        "id-ID": canonicalPath,
      },
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: fullUrl,
      type: "website",
      images: [
        {
          url: ogImage,
          alt: `Ikon aplikasi ${app.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const app = await AppStorageService.getPublicCatalogAppById(decodedId);

  if (!app) {
    notFound();
  }

  const canonicalUrl = getSiteUrl(`/aplikasi/${encodeURIComponent(app.id)}`);
  const imageUrl = app.iconUrl
    ? app.iconUrl.startsWith("http")
      ? app.iconUrl
      : getSiteUrl(app.iconUrl)
    : getSiteUrl(SITE_LOGO_PATH);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: app.name,
        headline: app.tagline || app.name,
        description: app.longDescription || app.description,
        applicationCategory: app.category || "UtilitiesApplication",
        operatingSystem: app.systemRequirements?.os || "Android",
        softwareVersion: app.version,
        fileSize: app.fileSize,
        url: canonicalUrl,
        image: imageUrl,
        inLanguage: "id-ID",
        author: {
          "@type": "Organization",
          name: app.developer || SITE_NAME,
          url: SITE_URL,
        },
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IDR",
          availability: "https://schema.org/InStock",
        },
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
          {
            "@type": "ListItem",
            position: 3,
            name: app.name,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AppDetailPageClient initialApp={app} />
    </>
  );
}
