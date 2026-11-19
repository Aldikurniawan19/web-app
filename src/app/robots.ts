import type { MetadataRoute } from "next";
import { getSiteUrl, SITE_URL } from "@/lib/site-seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/aplikasi", "/projek-web"],
        disallow: ["/admin", "/admin/", "/api/admin", "/api/admin/"],
      },
    ],
    sitemap: getSiteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
