import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { CatalogProvider } from "@/context/CatalogContext";
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

export const metadata: Metadata = {
  title: "Allprojects — Temukan dan Download Aplikasi Android Terbaik",
  description:
    "Download berbagai aplikasi Android terbaik dengan format APK yang mudah, cepat dan aman. Semua kebutuhan digitalmu ada di Allprojects!",
  applicationName: "Allprojects",
  authors: [{ name: "Allprojects Studio", url: "https://allprojects.com" }],
  keywords: [
    "Allprojects",
    "AllProjects",
    "Download Aplikasi",
    "Aplikasi Android",
    "APK Download",
    "Notely",
    "EduLearn",
    "KasirPro",
    "PhotoEditor",
    "Android Store",
  ],
  metadataBase: new URL("https://allprojects.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Allprojects — Temukan dan Download Aplikasi Android Terbaik",
    description:
      "Download berbagai aplikasi Android terbaik dengan format APK yang mudah, cepat dan aman.",
    url: "https://allprojects.com",
    siteName: "Allprojects",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Allprojects — Temukan dan Download Aplikasi Android Terbaik",
    description:
      "Download berbagai aplikasi Android terbaik dengan format APK yang mudah, cepat dan aman.",
  },
  icons: {
    icon: [
      { url: "/assets/logoAllProjects.png" },
      { url: "/assets/logoAllProjects.png", type: "image/png" },
    ],
    shortcut: "/assets/logoAllProjects.png",
    apple: "/assets/logoAllProjects.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Allprojects",
    operatingSystem: "Android",
    applicationCategory: "MobileApplication",
    description:
      "Download berbagai aplikasi Android terbaik dengan format APK yang mudah, cepat dan aman.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "5420",
    },
  };

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontBody.variable} scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/assets/logoAllProjects.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/assets/logoAllProjects.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/logoAllProjects.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Dancing+Script:wght@600;700&family=Outfit:wght@400..800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('apphub-theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <CatalogProvider>{children}</CatalogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
