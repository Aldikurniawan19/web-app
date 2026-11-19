import type { Metadata } from "next";
import { SITE_APPLE_ICON_PATH, SITE_FAVICON_PATH } from "@/lib/site-seo";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "Admin Portal — alllprojects APK Management",
  description: "Dashboard aman untuk mengelola dan mempublikasikan berkas APK Android beserta deskripsinya.",
  icons: {
    icon: SITE_FAVICON_PATH,
    shortcut: SITE_FAVICON_PATH,
    apple: SITE_APPLE_ICON_PATH,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
