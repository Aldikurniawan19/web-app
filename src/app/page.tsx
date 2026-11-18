import { AppStorageService } from "@/services/app-storage.service";
import { WebProjectService } from "@/services/web-project.service";
import { ApkSecurityService } from "@/services/apk-security.service";
import { pickFeaturedSecurityApp } from "@/lib/security-format";
import { HomeCatalogClient } from "@/features/home/HomeCatalogClient";
import type { AppItem } from "@/types/store";
import type { WebProjectItem } from "@/types/web-project";
import type { ApkSecurityReportDetail } from "@/types/security";

export const revalidate = 60;

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
    hasServerData = true;

    const featuredApp = pickFeaturedSecurityApp(initialApps);
    if (featuredApp) {
      initialSecurityDetail = await ApkSecurityService.getSecurityReport(
        featuredApp.id,
        featuredApp.version,
        { syncPending: false }
      );
    }
  } catch (error) {
    console.error("[AppHubPage] Gagal memuat katalog awal di server:", error);
  }

  return (
    <HomeCatalogClient
      initialApps={initialApps}
      initialWebProjects={initialWebProjects}
      initialSecurityDetail={initialSecurityDetail}
      hasServerData={hasServerData}
    />
  );
}
