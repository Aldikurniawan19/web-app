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
      ? `Jelajahi ${count} koleksi projek web modern, aplikasi web, SaaS, dan dashboard interaktif di AllProjects (AlllProjek / AllProjek).`
      : "Koleksi lengkap projek website modern, aplikasi web, dan dashboard interaktif karya AllProjects (AlllProjek / AllProjek).";

  return {
    title: "Katalog Projek Web Modern & Portofolio Web App",
    description,
    keywords: buildSeoKeywords([
      "katalog projek web",
      "contoh web app modern",
      "portofolio website",
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
      title: "Katalog Projek Web Modern & Portofolio Web App | AllProjects",
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
    hasServerData = true;
  } catch (error) {
    console.error("[AllWebProjectsPage] Gagal memuat daftar projek web di server:", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        url: getSiteUrl("/projek-web"),
        name: "Katalog Projek Web — AllProjects (AlllProjek)",
        description:
          "Koleksi projek web modern, landing page, SaaS, dan aplikasi web interaktif di AllProjects.",
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
        name: "Daftar Projek Web AllProjects",
        numberOfItems: initialWebProjects.length,
        itemListElement: initialWebProjects.slice(0, 20).map((proj, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "WebApplication",
            name: proj.name,
            description: proj.description,
            applicationCategory: proj.category || "WebApplication",
            url: proj.liveUrl || getSiteUrl("/projek-web"),
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
