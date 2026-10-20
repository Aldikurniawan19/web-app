import type { Metadata } from "next";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "Admin Portal — AllProjects APK Management",
  description: "Dashboard aman untuk mengelola dan mempublikasikan berkas APK Android beserta deskripsinya.",
  icons: {
    icon: "/assets/logoAllProjects.png",
    shortcut: "/assets/logoAllProjects.png",
    apple: "/assets/logoAllProjects.png",
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
