import type { MetadataRoute } from "next";
import { AppStorageService } from "@/services/app-storage.service";
import { WebProjectService } from "@/services/web-project.service";
import { getSiteUrl } from "@/lib/site-seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  let appEntries: Array<{ id: string; updatedAt: Date }> = [];
  let webEntries: Array<{ id: string; updatedAt: Date }> = [];

  try {
    [appEntries, webEntries] = await Promise.all([
      AppStorageService.getPublicSitemapEntries(),
      WebProjectService.getPublicSitemapEntries(),
    ]);
  } catch {
    // Tetap kirim sitemap utama meski database sedang tidak terjangkau saat build
  }

  const latestAppUpdate =
    appEntries.reduce<Date | null>(
      (max, entry) => (!max || entry.updatedAt > max ? entry.updatedAt : max),
      null
    ) ?? now;

  const latestWebUpdate =
    webEntries.reduce<Date | null>(
      (max, entry) => (!max || entry.updatedAt > max ? entry.updatedAt : max),
      null
    ) ?? now;

  const latestHomeUpdate =
    latestAppUpdate.getTime() >= latestWebUpdate.getTime()
      ? latestAppUpdate
      : latestWebUpdate;

  const appDetailUrls: MetadataRoute.Sitemap = appEntries.map((entry) => ({
    url: getSiteUrl(`/aplikasi/${encodeURIComponent(entry.id)}`),
    lastModified: entry.updatedAt,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const webDetailUrls: MetadataRoute.Sitemap = webEntries.map((entry) => ({
    url: getSiteUrl(`/projek-web/${encodeURIComponent(entry.id)}`),
    lastModified: entry.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

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
    ...appDetailUrls,
    ...webDetailUrls,
  ];
}
