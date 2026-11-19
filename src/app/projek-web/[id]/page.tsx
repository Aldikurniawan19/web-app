import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebProjectService } from "@/services/web-project.service";
import { WebProjectDetailPageClient } from "@/features/detail/WebProjectDetailPageClient";
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
    const entries = await WebProjectService.getPublicSitemapEntries();
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
  const project = await WebProjectService.getPublicWebProjectById(decodedId);

  if (!project) {
    return {
      title: "Projek Web Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = `/projek-web/${encodeURIComponent(project.id)}`;
  const fullUrl = getSiteUrl(canonicalPath);
  const title = `${project.name} — Projek Web ${project.category || "Modern"}`;
  const description = `${project.description} Jelajahi pratinjau, fitur, dan stack teknologi ${project.name} di katalog ${SITE_NAME}.`;
  const ogImage = project.imageUrl
    ? project.imageUrl.startsWith("http")
      ? project.imageUrl
      : getSiteUrl(project.imageUrl)
    : getSiteUrl(SITE_LOGO_PATH);

  return {
    title,
    description,
    keywords: buildSeoKeywords([
      project.name,
      project.category || "Projek Web",
      ...project.technologies,
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
          alt: `Tampilan sekilas ${project.name}`,
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

export default async function WebProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const project = await WebProjectService.getPublicWebProjectById(decodedId);

  if (!project) {
    notFound();
  }

  const canonicalUrl = getSiteUrl(
    `/projek-web/${encodeURIComponent(project.id)}`
  );
  const imageUrl = project.imageUrl
    ? project.imageUrl.startsWith("http")
      ? project.imageUrl
      : getSiteUrl(project.imageUrl)
    : getSiteUrl(SITE_LOGO_PATH);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: project.name,
        description: project.description,
        applicationCategory: project.category || "WebApplication",
        browserRequirements: "Requires JavaScript. Modern web browser.",
        url: project.liveUrl || canonicalUrl,
        image: imageUrl,
        inLanguage: "id-ID",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
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
            name: "Katalog Projek Web",
            item: getSiteUrl("/projek-web"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: project.name,
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
      <WebProjectDetailPageClient initialProject={project} />
    </>
  );
}
