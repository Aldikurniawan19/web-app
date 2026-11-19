import { prisma } from "@/lib/prisma";
import { isTransientDbError, withDbRetry as withRetry } from "@/lib/db-retry";
import { WebProjectItem, CreateWebProjectInput, UpdateWebProjectInput } from "@/types/web-project";
import { decodeDataImageUri, DecodedImageData } from "@/lib/media-decode";

const CACHE_TTL_MS = 60_000;
const DATA_URI_MARKER = "__DATA_URI__";

interface WebProjectCacheStore {
  cachedWebProjects: WebProjectItem[] | null;
  lastCacheTimestamp: number;
  pendingFetchPromise: Promise<WebProjectItem[]> | null;
  cachedPublicWebProjects: WebProjectItem[] | null;
  lastPublicCacheTimestamp: number;
  pendingPublicFetchPromise: Promise<WebProjectItem[]> | null;
}

const globalForWebCache = globalThis as unknown as {
  __allprojectsWebCacheV2?: WebProjectCacheStore;
};

/**
 * In-memory cache berbasis globalThis agar terbagi antara RSC dan API Route Handlers
 * untuk mengurangi beban query ke database Supabase.
 */
const webCache: WebProjectCacheStore =
  globalForWebCache.__allprojectsWebCacheV2 ??
  (globalForWebCache.__allprojectsWebCacheV2 = {
    cachedWebProjects: null,
    lastCacheTimestamp: 0,
    pendingFetchPromise: null,
    cachedPublicWebProjects: null,
    lastPublicCacheTimestamp: 0,
    pendingPublicFetchPromise: null,
  });

/**
 * Service Layer untuk Akses Data Projek Web di Supabase PostgreSQL.
 * Memisahkan logika bisnis dan query database dari Presentation layer.
 */
export class WebProjectService {
  /**
   * Kolom database yang di-select secara eksplisit untuk efisiensi transfer data.
   */
  private static readonly SELECT_COLUMNS = {
    id: true,
    name: true,
    description: true,
    imageUrl: true,
    technologies: true,
    liveUrl: true,
    githubUrl: true,
    category: true,
    featured: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  /**
   * Mengonversi record database ke interface WebProjectItem.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToItem(record: any): WebProjectItem {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      imageUrl: record.imageUrl || null,
      technologies: Array.isArray(record.technologies) ? record.technologies : [],
      liveUrl: record.liveUrl || null,
      githubUrl: record.githubUrl || null,
      category: record.category || "Web App",
      featured: Boolean(record.featured),
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : undefined,
      updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : undefined,
    };
  }

  /**
   * Membersihkan cache memory.
   */
  static invalidateCache(): void {
    webCache.cachedWebProjects = null;
    webCache.lastCacheTimestamp = 0;
    webCache.pendingFetchPromise = null;
    webCache.cachedPublicWebProjects = null;
    webCache.lastPublicCacheTimestamp = 0;
    webCache.pendingPublicFetchPromise = null;
  }

  /**
   * Mengambil seluruh projek web dari database Supabase.
   */
  static async getAllWebProjects(): Promise<WebProjectItem[]> {
    const now = Date.now();
    if (
      webCache.cachedWebProjects !== null &&
      now - webCache.lastCacheTimestamp < CACHE_TTL_MS
    ) {
      return webCache.cachedWebProjects;
    }

    if (webCache.pendingFetchPromise) {
      return webCache.pendingFetchPromise;
    }

    webCache.pendingFetchPromise = (async () => {
      try {
        let records = await withRetry(() =>
          prisma.webProject.findMany({
            select: this.SELECT_COLUMNS,
            orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          })
        );

        // Jika tabel masih kosong, inisialisasi dengan data contoh berkualitas tinggi
        if (records.length === 0) {
          const initialSamples: CreateWebProjectInput[] = [
            {
              id: "aerosync-cloud-web",
              name: "AeroSync Cloud Web",
              description:
                "Platform penyimpanan berkas dan sinkronisasi cloud terdistribusi dengan enkripsi end-to-end, preview instan, dan performa tinggi.",
              imageUrl:
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
              technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Prisma"],
              liveUrl: "https://aerosync.dev",
              githubUrl: "https://github.com/Aldikurniawan19/aerosync-web",
              category: "Cloud Platform",
              featured: true,
            },
            {
              id: "fintrack-analytics-hub",
              name: "FinTrack Analytics Hub",
              description:
                "Dashboard analitik keuangan bisnis terpadu dengan visualisasi arus kas real-time, forecasting otomatis, dan laporan eksekutif terstruktur.",
              imageUrl:
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
              technologies: ["React", "TypeScript", "Chart.js", "Tailwind CSS", "Node.js"],
              liveUrl: "https://fintrack.dev",
              githubUrl: "https://github.com/Aldikurniawan19/fintrack",
              category: "Fintech Dashboard",
              featured: true,
            },
            {
              id: "omniflow-task-workspace",
              name: "OmniFlow Workspace",
              description:
                "Ruang kerja kolaboratif tim modern dengan papan kanban dinamis, pelacak tenggat waktu, dan integrasi automasi alur kerja.",
              imageUrl:
                "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
              technologies: ["Next.js", "React", "Tailwind CSS", "GSAP", "PostgreSQL"],
              liveUrl: "https://omniflow.app",
              githubUrl: "https://github.com/Aldikurniawan19/omniflow",
              category: "Produktivitas",
              featured: false,
            },
          ];

          for (const sample of initialSamples) {
            try {
              await prisma.webProject.create({
                data: {
                  id: sample.id,
                  name: sample.name,
                  description: sample.description,
                  imageUrl: sample.imageUrl,
                  technologies: sample.technologies,
                  liveUrl: sample.liveUrl,
                  githubUrl: sample.githubUrl,
                  category: sample.category,
                  featured: Boolean(sample.featured),
                },
              });
            } catch {
              // Abaikan jika sudah ada
            }
          }

          records = await withRetry(() =>
            prisma.webProject.findMany({
              select: this.SELECT_COLUMNS,
              orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
            })
          );
        }

        const mapped = records.map(this.mapToItem);
        webCache.cachedWebProjects = mapped;
        webCache.lastCacheTimestamp = Date.now();
        return mapped;
      } catch (err) {
        if (isTransientDbError(err)) {
          console.warn(
            "[WebProjectService] Koneksi/DNS Supabase sedang tidak stabil, menggunakan cache/fallback:",
            err instanceof Error ? err.message : String(err)
          );
        } else {
          console.error("Gagal membaca projek web dari database Supabase:", err);
        }
        if (webCache.cachedWebProjects !== null) return webCache.cachedWebProjects;
        return [];
      } finally {
        webCache.pendingFetchPromise = null;
      }
    })();

    return webCache.pendingFetchPromise;
  }

  /**
   * Mengambil satu projek web berdasarkan ID.
   */
  static async getWebProjectById(id: string): Promise<WebProjectItem | null> {
    if (webCache.cachedWebProjects !== null) {
      const found = webCache.cachedWebProjects.find((item) => item.id === id);
      if (found) return found;
    }

    try {
      const record = await withRetry(() =>
        prisma.webProject.findUnique({
          where: { id },
          select: this.SELECT_COLUMNS,
        })
      );
      if (!record) return null;

      const item = this.mapToItem(record);
      if (webCache.cachedWebProjects !== null) {
        webCache.cachedWebProjects = [
          item,
          ...webCache.cachedWebProjects.filter((p) => p.id !== id),
        ];
      }
      return item;
    } catch (err) {
      console.error(`Gagal membaca projek web ${id} dari Supabase:`, err);
      return null;
    }
  }

  /**
   * Membuat projek web baru di database Supabase.
   */
  static async createWebProject(data: CreateWebProjectInput): Promise<WebProjectItem> {
    const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const record = await withRetry(() =>
      prisma.webProject.create({
        data: {
          id,
          name: data.name.trim(),
          description: data.description.trim(),
          imageUrl: data.imageUrl || null,
          technologies: data.technologies || [],
          liveUrl: data.liveUrl?.trim() || null,
          githubUrl: data.githubUrl?.trim() || null,
          category: data.category?.trim() || "Web App",
          featured: Boolean(data.featured),
        },
      })
    );

    const newItem = this.mapToItem(record);
    if (webCache.cachedWebProjects !== null) {
      webCache.cachedWebProjects = [
        newItem,
        ...webCache.cachedWebProjects.filter((p) => p.id !== newItem.id),
      ];
    } else {
      webCache.cachedWebProjects = [newItem];
    }
    webCache.lastCacheTimestamp = Date.now();
    webCache.cachedPublicWebProjects = null;
    webCache.lastPublicCacheTimestamp = 0;

    return newItem;
  }

  /**
   * Memperbarui projek web di database Supabase.
   */
  static async updateWebProject(
    id: string,
    data: UpdateWebProjectInput
  ): Promise<WebProjectItem | null> {
    const existing = await this.getWebProjectById(id);
    if (!existing) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: any = {};
    if (data.name !== undefined) dataToUpdate.name = data.name.trim();
    if (data.description !== undefined) dataToUpdate.description = data.description.trim();
    if (data.imageUrl !== undefined) dataToUpdate.imageUrl = data.imageUrl || null;
    if (data.technologies !== undefined) dataToUpdate.technologies = data.technologies;
    if (data.liveUrl !== undefined) dataToUpdate.liveUrl = data.liveUrl?.trim() || null;
    if (data.githubUrl !== undefined) dataToUpdate.githubUrl = data.githubUrl?.trim() || null;
    if (data.category !== undefined) dataToUpdate.category = data.category?.trim() || "Web App";
    if (data.featured !== undefined) dataToUpdate.featured = Boolean(data.featured);

    const record = await withRetry(() =>
      prisma.webProject.update({
        where: { id },
        data: dataToUpdate,
      })
    );

    const updatedItem = this.mapToItem(record);
    if (webCache.cachedWebProjects !== null) {
      const idx = webCache.cachedWebProjects.findIndex((p) => p.id === id);
      if (idx >= 0) {
        webCache.cachedWebProjects[idx] = updatedItem;
      } else {
        webCache.cachedWebProjects = [updatedItem, ...webCache.cachedWebProjects];
      }
    }
    webCache.lastCacheTimestamp = Date.now();
    webCache.cachedPublicWebProjects = null;
    webCache.lastPublicCacheTimestamp = 0;

    return updatedItem;
  }

  /**
   * Menghapus projek web berdasarkan ID.
   */
  static async deleteWebProject(id: string): Promise<boolean> {
    if (webCache.cachedWebProjects !== null) {
      webCache.cachedWebProjects = webCache.cachedWebProjects.filter(
        (p) => p.id !== id
      );
    }
    webCache.lastCacheTimestamp = Date.now();
    webCache.cachedPublicWebProjects = null;
    webCache.lastPublicCacheTimestamp = 0;

    try {
      await withRetry(() =>
        prisma.webProject.delete({
          where: { id },
        })
      );
      return true;
    } catch (err) {
      console.error(`Gagal menghapus projek web ${id} di Supabase:`, err);
      return false;
    }
  }

  /**
   * Mengambil statistik projek web untuk admin dashboard.
   */
  static async getStats() {
    const items = await this.getAllWebProjects();
    const categories = Array.from(new Set(items.map((i) => i.category)));
    return {
      totalWebProjects: items.length,
      categoriesCount: categories.length,
      latestUpdated: items[0]?.updatedAt || items[0]?.createdAt || "-",
    };
  }

  /**
   * Mengembalikan timestamp pembaruan terakhir tabel projek web untuk sitemap.xml (query ultra-ringan).
   */
  static async getLatestUpdatedAt(): Promise<Date | null> {
    try {
      const latest = await withRetry(() =>
        prisma.webProject.findFirst({
          orderBy: { updatedAt: "desc" },
          select: { updatedAt: true },
        })
      );
      return latest?.updatedAt ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Mengembalikan daftar projek web ringan untuk SSR/publik tanpa mengunduh blob gambar Base64 dari PostgreSQL.
   */
  static async getPublicWebProjects(): Promise<WebProjectItem[]> {
    const now = Date.now();
    if (
      webCache.cachedPublicWebProjects !== null &&
      now - webCache.lastPublicCacheTimestamp < CACHE_TTL_MS
    ) {
      return webCache.cachedPublicWebProjects;
    }

    if (webCache.pendingPublicFetchPromise) {
      return webCache.pendingPublicFetchPromise;
    }

    webCache.pendingPublicFetchPromise = (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const records = await withRetry(() =>
          prisma.$queryRaw<Array<Record<string, unknown>>>`
            SELECT
              "id",
              "name",
              "description",
              CASE
                WHEN COALESCE("imageUrl", '') LIKE 'data:image/%' THEN ${DATA_URI_MARKER}
                ELSE "imageUrl"
              END AS "imageUrl",
              "technologies",
              "liveUrl",
              "githubUrl",
              "category",
              "featured",
              "createdAt",
              "updatedAt"
            FROM "web_projects"
            ORDER BY "featured" DESC, "createdAt" DESC
          `
        );

        const mapped = records.map((rec) => {
          const item = this.mapToItem(rec);
          if (item.imageUrl !== DATA_URI_MARKER) return item;
          const vSource = item.updatedAt || item.createdAt;
          const vTag = vSource ? new Date(vSource).getTime().toString(36) : "1";
          return {
            ...item,
            imageUrl: `/api/web-projects/media/${encodeURIComponent(item.id)}?v=${vTag}`,
          };
        });

        webCache.cachedPublicWebProjects = mapped;
        webCache.lastPublicCacheTimestamp = Date.now();
        return mapped;
      } catch (err) {
        if (isTransientDbError(err)) {
          console.warn(
            "[WebProjectService] Koneksi/DNS Supabase sedang tidak stabil saat memuat katalog publik:",
            err instanceof Error ? err.message : String(err)
          );
        } else {
          console.error("Gagal membaca katalog publik projek web dari Supabase:", err);
        }
        if (webCache.cachedPublicWebProjects !== null) {
          return webCache.cachedPublicWebProjects;
        }
        return [];
      } finally {
        webCache.pendingPublicFetchPromise = null;
      }
    })();

    return webCache.pendingPublicFetchPromise;
  }

  /**
   * Mengambil data biner gambar projek web untuk endpoint HTTP media cacheable.
   */
  static async getProjectImageBinary(
    projectId: string
  ): Promise<DecodedImageData | { redirectUrl: string } | null> {
    let imageUrl: string | null = null;
    if (webCache.cachedWebProjects) {
      const cached = webCache.cachedWebProjects.find((p) => p.id === projectId);
      if (cached) imageUrl = cached.imageUrl ?? null;
    }

    if (!imageUrl) {
      const record = await withRetry(() =>
        prisma.webProject.findUnique({
          where: { id: projectId },
          select: { imageUrl: true },
        })
      );
      imageUrl = record?.imageUrl || null;
    }

    if (!imageUrl) return null;
    const decoded = decodeDataImageUri(imageUrl);
    if (decoded) return decoded;
    return { redirectUrl: imageUrl };
  }
}
