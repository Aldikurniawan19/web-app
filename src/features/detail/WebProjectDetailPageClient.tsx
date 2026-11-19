"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WebProjectDetailView } from "@/features/detail/WebProjectDetailView";
import { useCatalog } from "@/context/CatalogContext";
import type { WebProjectItem } from "@/types/web-project";

interface WebProjectDetailPageClientProps {
  initialProject: WebProjectItem;
}

/**
 * Wrapper halaman detail projek web khusus (/projek-web/[id]) berbasis SSR/ISR
 * agar setiap projek web dapat diindeks dan dibagikan lewat URL masing-masing.
 */
export function WebProjectDetailPageClient({
  initialProject,
}: WebProjectDetailPageClientProps) {
  const router = useRouter();
  const { webProjects: contextProjects } = useCatalog();

  const matchedFromContext = contextProjects.find(
    (item) => item.id === initialProject.id
  );
  const project = matchedFromContext ?? initialProject;

  const handleBackToCatalog = () => {
    router.push("/projek-web");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar activeNav="aplikasi" />

      <main className="flex-1 w-full">
        <WebProjectDetailView
          project={project}
          onBack={handleBackToCatalog}
          breadcrumbs={[
            {
              label: "Beranda",
              icon: Home,
              href: "/",
            },
            {
              label: "Katalog Projek Web",
              href: "/projek-web",
            },
            {
              label: `Detail ${project.name}`,
              isCurrent: true,
            },
          ]}
        />
      </main>

      <Footer />
    </div>
  );
}
