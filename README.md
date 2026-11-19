# alllprojects

**alllprojects** ([alllprojects.my.id](https://alllprojects.my.id)) adalah platform katalog resmi untuk mendistribusikan aplikasi Android (`.apk`) yang terverifikasi bebas virus melalui VirusTotal API v3 sekaligus menampilkan koleksi projek web modern dalam satu ekosistem.

- Website Resmi: [https://alllprojects.my.id](https://alllprojects.my.id)
- Katalog Aplikasi Android APK: [https://alllprojects.my.id/aplikasi](https://alllprojects.my.id/aplikasi)
- Katalog Projek Web: [https://alllprojects.my.id/projek-web](https://alllprojects.my.id/projek-web)

---

## Fitur Utama

- **Katalog Aplikasi Android APK**: Distribusi berkas `.apk` terintegrasi dengan GitHub Releases, lengkap dengan riwayat versi, changelog, statistik unduhan, dan panduan pemasangan langkah demi langkah.
- **Verifikasi Keamanan VirusTotal API v3**: Pemindaian otomatis/manual berkas APK dengan sidik jari kriptografis SHA-256, ringkasan hasil multi-mesin antivirus, dan tautan bukti resmi VirusTotal.
- **Katalog Projek Web**: Etalase aplikasi web, landing page, SaaS, dan dashboard interaktif lengkap dengan pratinjau tampilan, daftar teknologi, serta tautan live demo & repository.
- **Pratinjau Perangkat Interaktif**: Showcase tampilan layar aplikasi pada mockup smartphone di halaman utama.
- **Portal Admin Terproteksi**: Pengelolaan aplikasi APK, rilis versi baru, pemindaian keamanan VirusTotal, dan CRUD projek web melalui `/admin`.
- **Optimasi Performa & SEO**: Server-Side Rendering / ISR (`revalidate = 60`), optimasi gambar WebP/AVIF melalui `next/image` & endpoint media biner cacheable, `sitemap.xml` dinamis, `robots.txt`, Open Graph, dan structured data JSON-LD (`Organization`, `WebSite`, `CollectionPage`, `ItemList`, `FAQPage`).

---

## Teknologi yang Digunakan

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling & UI**: Tailwind CSS, Lucide Icons, Embla Carousel, GSAP
- **Database & ORM**: Supabase PostgreSQL, Prisma 7 (`@prisma/adapter-pg`, `pg`)
- **Integrasi Eksternal**: GitHub Releases API (penyimpanan rilis APK), VirusTotal API v3 (verifikasi keamanan APK)
- **Deployment**: Vercel

---

## Struktur Direktori Utama

```text
src/
├── app/            # Routing halaman publik (/ , /aplikasi, /projek-web), /admin, dan API Route Handlers
├── components/     # Komponen UI reusable dan layout (Navbar, Footer, FloatingBottomBar, IPhoneMockup)
├── constants/      # Data statis dan daftar kategori
├── context/        # CatalogContext (sinkronisasi katalog & cache sesi)
├── features/       # Modul fitur (hero, catalog, detail, security, guide, download, admin)
├── lib/            # Prisma client, retry DB, konfigurasi SEO (site-seo.ts), utilitas auth & media
├── services/       # Layer akses data & logika bisnis (AppStorageService, WebProjectService, ApkSecurityService, GithubReleaseService)
├── styles/         # Token warna dan tipografi terpusat (tokens.css)
└── types/          # Definisi tipe TypeScript
prisma/
└── schema.prisma   # Skema tabel PostgreSQL (apps, app_versions, apk_security_scans, web_projects)
```

---

## Menjalankan Secara Lokal

### 1. Prasyarat

- Node.js 20 atau lebih baru
- Database PostgreSQL (misalnya Supabase)

### 2. Instalasi Dependensi

```bash
git clone https://github.com/Aldikurniawan19/web-app.git
cd web-app
npm install
```

### 3. Konfigurasi Environment Variable

Salin berkas `.env.example` menjadi `.env` lalu sesuaikan nilainya:

```env
# Koneksi Database Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Integrasi GitHub Releases untuk penyimpanan berkas APK
GITHUB_TOKEN="your_github_personal_access_token"
GITHUB_REPO_OWNER="Aldikurniawan19"
GITHUB_REPO_NAME="app-release"
GITHUB_RELEASE_TAG="apk-releases"

# Autentikasi Portal Admin
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your_strong_password"
AUTH_SECRET="your_random_secret_key"

# VirusTotal API v3 untuk pemindaian keamanan APK
VIRUSTOTAL_API_KEY="your_virustotal_api_key"

# Konfigurasi SEO (opsional)
NEXT_PUBLIC_SITE_URL="https://alllprojects.my.id"
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""
```

### 4. Generate Prisma Client & Jalankan Server

```bash
npx prisma generate
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

### 5. Build Produksi

```bash
npm run build
npm run start
```

---

## Tautan

- Situs Produksi: [https://alllprojects.my.id](https://alllprojects.my.id)
- GitHub: [https://github.com/Aldikurniawan19](https://github.com/Aldikurniawan19)
