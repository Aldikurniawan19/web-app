# Aturan Penulisan Kode — Standar Senior Developer (Berlaku untuk Semua Bahasa & Framework)

Dokumen ini adalah panduan universal, berlaku untuk project apapun — PHP (Laravel, CodeIgniter, native PHP), JavaScript/TypeScript (Next.js, React, Vue, Node/Express), Python (Django, FastAPI), Java (Spring), Go, dan lainnya. Prinsip di sini adalah prinsip rekayasa perangkat lunak yang tidak terikat bahasa. Bagian yang butuh contoh konkret diberi ilustrasi untuk beberapa stack populer, tapi **aturannya wajib diterapkan meski contoh persisnya tidak ada di sini** — sesuaikan dengan idiom/konvensi bahasa & framework yang dipakai.

---

## 1. Prinsip Umum (Berlaku di Semua Bahasa)

- Tulis kode untuk **dibaca manusia dulu, dieksekusi mesin kedua**. Penamaan variabel, fungsi, class, dan file harus jelas maksudnya tanpa perlu membaca isinya.
- **DRY** (Don't Repeat Yourself) — logika yang dipakai berulang (2x atau lebih) wajib diekstrak jadi fungsi, class, service, helper, atau komponen.
- **Single Responsibility** — satu fungsi/class/file/modul hanya menangani satu tanggung jawab.
- **Separation of Concerns** — pisahkan logika presentasi (UI/View), logika bisnis (Service/Domain), dan akses data (Repository/Model) sebagai lapisan berbeda. Ini berlaku baik di MVC (Laravel, CodeIgniter) maupun arsitektur modern (Next.js App Router, dsb).
- Jangan over-engineering. Pilih solusi paling simpel yang tetap scalable, bukan solusi rumit untuk kebutuhan yang belum tentu ada.
- Gunakan **static typing** jika bahasanya mendukung (TypeScript daripada JavaScript polos, type declaration di PHP 8+, type hint di Python) untuk menangkap error sejak development.
- Tangani **error dan edge case** secara eksplisit di setiap layer (validasi input, null/undefined check, try/catch) — jangan asumsikan data selalu ideal.
- Hindari magic number/string — pindahkan ke konstanta, enum, atau file konfigurasi bernama jelas.
- Ikuti **konvensi resmi/idiomatik bahasa dan framework yang dipakai** (PSR untuk PHP, Laravel/CodeIgniter conventions, Airbnb/community style guide untuk JS/TS, PEP8 untuk Python, dst) — jangan memaksakan gaya satu bahasa ke bahasa lain.

---

## 2. Struktur Folder — Prinsip Universal

**Prinsip inti**, apapun bahasanya:
1. Organisasi **berbasis fitur/domain**, bukan menumpuk semua file sejenis dalam satu folder raksasa yang tidak terkelola.
2. **Pisahkan layer**: Presentation (View/UI) → Business Logic (Service/Use Case) → Data Access (Repository/Model/Query) → Infrastructure (config, DB connection, third-party client).
3. **Konsisten**: penamaan folder & file mengikuti satu pola dari awal sampai akhir project.
4. File konfigurasi, environment variable, dan credential terpisah dari source code, tidak pernah ter-commit ke repository.

### Contoh struktur per stack (ilustrasi, sesuaikan dengan konvensi resmi masing-masing)

**Laravel (PHP)** — ikuti struktur default Laravel, perkaya dengan Service & Repository layer:
```
app/
├── Console/
├── Exceptions/
├── Http/
│   ├── Controllers/       # Hanya terima request, panggil Service, return response
│   ├── Requests/          # Form Request untuk validasi input
│   ├── Resources/         # API Resource untuk format response
│   └── Middleware/
├── Models/                 # Eloquent model, representasi tabel
├── Services/                # Logika bisnis, dipanggil dari Controller
├── Repositories/             # Query kompleks/reusable, dipanggil dari Service
├── Providers/
routes/
├── web.php
├── api.php
database/
├── migrations/
├── seeders/
├── factories/
resources/
├── views/                    # Blade template
tests/
├── Feature/
├── Unit/
config/
.env
```

**CodeIgniter (PHP)** — ikuti struktur MVC bawaan, tambahkan Service layer agar Controller tetap ramping:
```
app/
├── Controllers/            # Hanya orkestrasi request/response
├── Models/                  # Akses data
├── Services/                 # Logika bisnis (folder tambahan, bukan bawaan CI, tapi best practice)
├── Views/
├── Filters/                   # Middleware-nya CodeIgniter
├── Config/
├── Database/
│   ├── Migrations/
│   └── Seeds/
tests/
.env
```

**Next.js (JS/TS)**:
```
src/
├── app/ atau pages/          # Routing
├── components/                # UI reusable
│   ├── ui/
│   └── layout/
├── features/                   # Logika per fitur (component, hook, service khusus fitur)
├── lib/                          # Helper umum, DB client, fetcher
├── services/ atau repositories/    # Akses data / query
├── hooks/
├── styles/                          # Token warna & font terpusat (lihat bagian 4)
├── constants/
├── types/
prisma/ atau drizzle/                 # Schema & migration
tests/
.env.local
```

**Prinsip yang sama juga berlaku** untuk Django (`apps/`, `services.py`, `models.py`, `serializers.py`), Spring Boot (`controller/`, `service/`, `repository/`, `entity/`), Express/Node (`routes/`, `controllers/`, `services/`, `models/`), dan framework lain — namanya boleh beda, konsepnya sama: **Controller/Handler tipis, logika bisnis di Service, akses data di Repository/Model.**

### Konvensi penamaan (sesuaikan dengan standar bahasa masing-masing)
- PHP (PSR-1/PSR-12): Class `PascalCase`, method/variable `camelCase`, file class mengikuti nama class.
- JavaScript/TypeScript: Komponen `PascalCase`, fungsi/variable `camelCase`, file non-komponen `kebab-case`.
- Python (PEP8): fungsi/variable `snake_case`, class `PascalCase`.
- Konstanta global: `UPPER_SNAKE_CASE` di semua bahasa.
- Satu class/komponen besar = satu file. Pecah jadi sub-bagian jika sudah terlalu besar, jangan biarkan satu file menggembung ratusan/ribuan baris.

---

## 3. SEO Friendly — Berlaku untuk Semua Stack yang Render Halaman Web

Wajib diterapkan di setiap halaman publik yang perlu ter-index search engine, apapun bahasa back-end-nya:

- **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>` — bukan `<div>` untuk semua, baik itu di-render Blade (Laravel), View PHP (CodeIgniter), atau JSX (Next.js).
- **Hierarki heading benar**: satu `<h1>` per halaman, level heading berurutan tanpa loncat.
- **Meta tag lengkap** per halaman: `title` unik, `meta description`, `canonical URL`, Open Graph, Twitter Card.
  - Laravel/CodeIgniter: di-set dari Controller/Service, dikirim ke View sebagai variabel.
  - Next.js: gunakan Metadata API (App Router) atau `next/head` (Pages Router).
- **Gambar**: atribut `alt` deskriptif wajib ada, format modern (WebP/AVIF), `loading="lazy"` untuk gambar di luar viewport, `width`/`height` eksplisit untuk mencegah layout shift.
- **URL bersih**: slug deskriptif dan konsisten (`/produk/sepatu-lari-pria`), lowercase, pakai dash, hindari parameter tidak perlu.
- **Structured data (JSON-LD)** untuk konten relevan (produk, artikel, breadcrumb, organisasi).
- **Performance / Core Web Vitals**: hindari render-blocking script, kompres asset, gunakan caching (HTTP cache header di Laravel/CodeIgniter, ISR/SSG di Next.js).
- **Sitemap.xml & robots.txt** wajib ada dan ter-update otomatis, apapun stack-nya.
- Untuk konten publik yang perlu ter-index: pastikan HTML akhir sudah berisi konten (server-rendered), bukan hanya kerangka kosong yang diisi JavaScript belakangan. Di PHP framework ini otomatis terjadi (server-rendered by default); di Next.js gunakan SSR/SSG/ISR, hindari client-side rendering murni untuk halaman publik.
- Internal linking yang relevan antar halaman untuk membantu crawler memahami struktur situs.

---

## 4. Definisi Warna & Font — Satu File Sumber Kebenaran

Berlaku untuk stack apapun: semua definisi warna dan tipografi **wajib terpusat di satu file/lokasi**, tidak boleh hardcode warna/font langsung tersebar di banyak file view/komponen.

**Untuk project berbasis CSS/Tailwind (berlaku baik dipanggil dari Blade, View PHP, maupun JSX):**

```css
/* resources/css/tokens.css atau src/styles/tokens.css */
:root {
  /* Warna */
  --color-background: #ffffff;
  --color-foreground: #111111;
  --color-primary: #2563eb;
  --color-secondary: #6b7280;
  --color-accent: #f59e0b;
  --color-danger: #dc2626;
  --color-success: #16a34a;

  /* Font */
  --font-display: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;

  /* Ukuran font */
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;
}
```

**Jika pakai Tailwind** (berlaku sama di Laravel Mix/Vite, CodeIgniter, maupun Next.js) — definisikan di `tailwind.config.js`:

```js
export default {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#111111",
        primary: "#2563EB",
        secondary: "#6B7280",
        accent: "#F59E0B",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
};
```

**Aturan (berlaku universal):**
- Semua View/Component memanggil token ini (`var(--color-primary)`, class Tailwind `bg-primary`, atau SCSS variable) — tidak boleh menulis hex code langsung di file View/Component manapun.
- Jika ada dark mode, definisikan varian token di file yang sama, jangan buat sistem warna terpisah.
- Penambahan warna/font baru wajib lewat file token ini, selaras dengan file `aturan-desain.md`.

---

## 5. Database & Query — Best Practice Universal

Berlaku untuk **semua bahasa dan semua jenis operasi**: Read, Create, Update, Delete — baik pakai ORM (Eloquent, Prisma, Doctrine, SQLAlchemy) maupun query builder/raw SQL (Query Builder CodeIgniter, PDO, dsb).

### Prinsip umum (tidak tergantung bahasa)
- Semua akses database **hanya melalui satu layer** (Repository/Service di Laravel, Model di CodeIgniter, `services/` atau `repositories/` di Next.js/Node) — jangan tulis query langsung di Controller, Route handler, atau View/Component.
- **Selalu gunakan parameterized query / prepared statement** atau ORM. **Tidak pernah** membangun query dengan string concatenation dari input user — ini adalah celah SQL Injection, berlaku di semua bahasa.
- Kredensial database **selalu dari environment variable** (`.env`), tidak pernah hardcode, tidak pernah ter-commit ke repository.

### Optimasi query (berlaku di MySQL, PostgreSQL, dsb, apapun ORM-nya)
- **Ambil hanya kolom yang dibutuhkan** — hindari `SELECT *`, terutama di tabel besar.
  - Laravel: `->select('id', 'name', 'email')`
  - CodeIgniter: `->select('id, name, email')`
  - Prisma/Next.js: `select: { id: true, name: true, email: true }`
- Gunakan **index** pada kolom yang sering dipakai untuk `WHERE`, `JOIN`, `ORDER BY`. Cek query plan (`EXPLAIN`/`EXPLAIN ANALYZE`) untuk query yang lambat, apapun stack-nya.
- **Pagination wajib** untuk data list besar (cursor-based untuk dataset besar, offset/limit untuk dataset kecil-menengah).
  - Laravel: `->paginate()`
  - CodeIgniter: gunakan library Pagination bawaan
  - Next.js/Prisma: `skip`/`take` atau cursor pagination
- Hindari **N+1 query problem** — gunakan eager loading, bukan query di dalam loop:
  - Laravel: `::with('relasi')` bukan query relasi di dalam `foreach`
  - CodeIgniter: gunakan `whereIn` untuk ambil data relasi sekaligus, bukan query per-baris di loop
  - Prisma: `include`/`with`, atau DataLoader untuk batching
- Gunakan **connection pooling** untuk aplikasi traffic tinggi (built-in di kebanyakan framework modern, pastikan dikonfigurasi dengan benar).
- Cache query yang sering diakses tapi jarang berubah (Redis, Memcached, atau cache bawaan framework — Laravel Cache facade, Next.js `unstable_cache`/ISR), dengan strategi invalidation yang jelas.

### Create / Update / Delete (berlaku semua bahasa)
- Bungkus operasi multi-tabel dalam **transaction** agar konsisten (all-or-nothing):
  - Laravel: `DB::transaction()`
  - CodeIgniter: `$this->db->transStart()` / `transComplete()`
  - Prisma: `$transaction()`
- **Validasi input sebelum masuk ke query**, jangan andalkan database sebagai validator utama:
  - Laravel: Form Request (`FormRequest` class)
  - CodeIgniter: library Validation bawaan
  - Next.js/Node: Zod, Yup, atau validator sejenis
- Untuk data penting, pertimbangkan **soft delete** (kolom `deleted_at`/`deletedAt`) dibanding hard delete agar data bisa dipulihkan.
- Gunakan **optimistic locking** (kolom `version`) untuk mencegah race condition saat update bersamaan, jika relevan dengan kasusnya.

### Keamanan (berlaku universal)
- Terapkan **least privilege**: user/service database hanya diberi akses sesuai kebutuhan (read-only untuk service yang cuma baca data).
- **Jangan pernah** menampilkan error database mentah (stack trace, query, struktur tabel) ke response yang dilihat user — log detail di server (log file, Sentry, dsb), tampilkan pesan generik ke client.
- Sanitize dan validasi semua input yang masuk ke query, termasuk dari query string, body request, header, dan file upload.

---

## 6. Best Practice Umum (Checklist Senior Developer — Berlaku untuk Semua Project)

- [ ] Kode sudah lolos linting & formatting otomatis sesuai bahasa (ESLint+Prettier untuk JS/TS, PHP-CS-Fixer/Pint untuk PHP, Black untuk Python, dst) — jangan andalkan review manual untuk styling.
- [ ] Tidak ada kode debug tertinggal (`console.log`, `dd()`, `var_dump()`, `print_r`) sebelum merge ke branch utama.
- [ ] Environment variable terpisah per environment (local/staging/production), tidak ada secret yang ter-commit ke repository.
- [ ] Setiap logika bisnis penting punya test (unit test minimal untuk happy path & edge case utama), baik itu PHPUnit/Pest (PHP) atau Jest/Vitest (JS/TS).
- [ ] Commit message jelas dan mengikuti konvensi (mis: `feat:`, `fix:`, `refactor:`, `chore:`).
- [ ] Tidak ada duplikasi logika yang seharusnya jadi satu fungsi/service/helper.
- [ ] Semua warna & font hanya dari file token pusat (bagian 4), tidak ada hardcode di View/Component manapun.
- [ ] Semua query database melalui layer Service/Repository, dioptimasi (bagian 5), dan tervalidasi sebelum eksekusi.
- [ ] Halaman publik memenuhi checklist SEO (bagian 3) sebelum dianggap selesai.
- [ ] Controller/Route handler tetap tipis — hanya menerima request dan mengembalikan response, logika bisnis ada di Service.
- [ ] Struktur folder mengikuti pemisahan layer yang konsisten (bagian 2), tidak ada file "numpuk" di satu folder tanpa organisasi.
- [ ] Dokumentasi singkat ditambahkan untuk fungsi/class/modul yang tidak self-explanatory (PHPDoc, JSDoc/TSDoc, docstring Python, sesuai bahasanya).
- [ ] Kode baru tidak menurunkan performa (cek waktu response API, waktu load halaman, jumlah query per request) dibanding sebelumnya.
