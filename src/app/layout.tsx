import type { Metadata } from "next";
import { Outfit, DM_Sans, JetBrains_Mono, Dancing_Script } from "next/font/google";
import { CatalogProvider } from "@/context/CatalogContext";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import {
  buildSeoKeywords,
  getSiteUrl,
  SITE_ALTERNATE_NAMES,
  SITE_APPLE_ICON_PATH,
  SITE_FAVICON_PATH,
  SITE_GITHUB_URL,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_PUBLISHER,
  SITE_URL,
} from "@/lib/site-seo";
import "./globals.css";

const fontDisplay = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const fontBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const fontScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  weight: ["600", "700"],
  display: "swap",
  preload: false,
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "alllprojects — Pusat Aplikasi Android APK Aman & Projek Web",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "alllprojects adalah pusat download aplikasi Android APK gratis, aman, dan terverifikasi bebas virus VirusTotal, serta koleksi projek web modern dalam satu platform.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_PUBLISHER, url: SITE_URL }],
  creator: SITE_PUBLISHER,
  publisher: SITE_PUBLISHER,
  category: "technology",
  keywords: buildSeoKeywords(),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(googleVerification
    ? {
        verification: {
          google: googleVerification,
        },
      }
    : {}),
  openGraph: {
    title: "alllprojects — Pusat Aplikasi Android APK Aman & Projek Web",
    description:
      "Unduh berkas APK Android terverifikasi bebas virus dengan riwayat versi rapi dan jelajahi koleksi projek web modern di alllprojects (alllprojects.my.id).",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: SITE_LOGO_PATH,
        width: 512,
        height: 512,
        alt: "Logo alllprojects — Pusat Aplikasi Android & Projek Web",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "alllprojects — Pusat Aplikasi Android APK & Projek Web",
    description:
      "Download aplikasi Android APK aman bebas virus VirusTotal dan jelajahi katalog projek web modern di alllprojects.",
    images: [SITE_LOGO_PATH],
  },
  icons: {
    icon: [
      { url: SITE_FAVICON_PATH, type: "image/png", sizes: "48x48" },
    ],
    shortcut: SITE_FAVICON_PATH,
    apple: [
      { url: SITE_APPLE_ICON_PATH, type: "image/png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data JSON-LD Global (Organization & WebSite dengan alternateName & SearchAction)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: [...SITE_ALTERNATE_NAMES],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: getSiteUrl(SITE_LOGO_PATH),
        },
        sameAs: [SITE_GITHUB_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: [...SITE_ALTERNATE_NAMES],
        description:
          "Pusat aplikasi Android APK terverifikasi bebas virus VirusTotal dan koleksi projek web modern di alllprojects.my.id.",
        inLanguage: "id-ID",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang="id"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} ${fontScript.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white transition-colors duration-200">
        <SmoothScrollProvider>
          <CatalogProvider>{children}</CatalogProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
