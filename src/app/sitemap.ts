import type { MetadataRoute } from "next";
import { AppStorageService } from "@/services/app-storage.service";
import { WebProjectService } from "@/services/web-project.service";
import { getSiteUrl } from "@/lib/site-seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  let latestAppUpdate = now;
  let latestWebUpdate = now;

  try {
    const [appUpdatedAt, webUpdatedAt] = await Promise.all([
      AppStorageService.getLatestUpdatedAt(),
      WebProjectService.getLatestUpdatedAt(),
    ]);

    if (appUpdatedAt) {
      latestAppUpdate = appUpdatedAt;
    }
    if (webUpdatedAt) {
      latestWebUpdate = webUpdatedAt;
    }
  } catch {
    // Tetap kirim sitemap utama meski database sedang tidak terjangkau saat build
  }

  const latestHomeUpdate =
    latestAppUpdate.getTime() >= latestWebUpdate.getTime()
      ? latestAppUpdate
      : latestWebUpdate;

  return [
    {
      url: getSiteUrl("/"),
      lastModified: latestHomeUpdate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: getSiteUrl("/aplikasi"),
      lastModified: latestAppUpdate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getSiteUrl("/projek-web"),
      lastModified: latestWebUpdate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
