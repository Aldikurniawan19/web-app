import type { Metadata } from "next";
import { WebProjectService } from "@/services/web-project.service";
import { AllWebProjectsPageClient } from "@/features/catalog/AllWebProjectsPageClient";
import { buildSeoKeywords, getSiteUrl, SITE_URL } from "@/lib/site-seo";
import type { WebProjectItem } from "@/types/web-project";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  let webKeywords: string[] = [];
  let count = 0;

  try {
    const projects = await WebProjectService.getPublicWebProjects();
    count = projects.length;
    webKeywords = projects.flatMap((proj) => [
      proj.name,
      proj.category || "Web App",
      ...proj.technologies.slice(0, 4),
    ]);
  } catch {
    // Gunakan kata kunci dasar bila database belum terjangkau
  }

  const description =
    count > 0
      ? `Jelajahi ${count} koleksi projek web modern, aplikasi web, SaaS, dan dashboard interaktif di alllprojects.`
      : "Koleksi lengkap projek website modern, aplikasi web, dan dashboard interaktif karya alllprojects.";

  return {
    title: "Katalog Projek Web Modern & Portofolio Web App",
    description,
    keywords: buildSeoKeywords([
      "katalog projek web",
      "contoh web app modern",
      "portofolio website",
      "alllprojects web",
      "alllprojek web",
      "allprojek web",
      ...webKeywords,
    ]),
    alternates: {
      canonical: "/projek-web",
      languages: {
        "id-ID": "/projek-web",
      },
    },
    openGraph: {
      title: "Katalog Projek Web Modern & Portofolio Web App | alllprojects",
      description,
      url: getSiteUrl("/projek-web"),
    },
  };
}

export default async function AllWebProjectsPage() {
  let initialWebProjects: WebProjectItem[] = [];
  let hasServerData = false;

  try {
    initialWebProjects = await WebProjectService.getPublicWebProjects();
    hasServerData = initialWebProjects.length > 0;
  } catch (error) {
    console.error("[AllWebProjectsPage] Gagal memuat daftar projek web di server:", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        url: getSiteUrl("/projek-web"),
        name: "Katalog Projek Web — alllprojects",
        description:
          "Koleksi projek web modern, landing page, SaaS, dan aplikasi web interaktif di alllprojects.",
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
            name: "Katalog Projek Web",
            item: getSiteUrl("/projek-web"),
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "Daftar Projek Web alllprojects",
        numberOfItems: initialWebProjects.length,
        itemListElement: initialWebProjects.slice(0, 20).map((proj, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "WebApplication",
            name: proj.name,
            description: proj.description,
            applicationCategory: proj.category || "WebApplication",
            url: getSiteUrl(`/projek-web/${encodeURIComponent(proj.id)}`),
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
      <AllWebProjectsPageClient
        initialWebProjects={initialWebProjects}
        hasServerData={hasServerData}
      />
    </>
  );
}
