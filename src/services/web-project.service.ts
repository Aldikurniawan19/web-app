import { prisma } from "@/lib/prisma";
import { WebProjectItem, CreateWebProjectInput, UpdateWebProjectInput } from "@/types/web-project";

/**
 * In-memory cache untuk mengurangi beban query ke database Supabase.
 */
let cachedWebProjects: WebProjectItem[] | null = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 60_000;
let pendingFetchPromise: Promise<WebProjectItem[]> | null = null;

/**
 * Helper auto-retry query jika ada gangguan koneksi transien ke Supabase.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient =
        msg.includes("Connection terminated") ||
        msg.includes("closed") ||
        msg.includes("timeout") ||
        msg.includes("57014") ||
        msg.includes("ECONNRESET") ||
        msg.includes("ENOTFOUND") ||
        msg.includes("connection pool");

      if (isTransient && attempt < maxRetries) {
        console.warn(
          `[WebProject Retry] Percobaan ke-${attempt + 1} setelah error: ${msg.slice(0, 80)}`
        );
        await new Promise((r) => setTimeout(r, 300 * attempt));
        continue;
      }
      throw err;
    }
  }
}

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
    cachedWebProjects = null;
    lastCacheTimestamp = 0;
    pendingFetchPromise = null;
  }

  /**
   * Mengambil seluruh projek web dari database Supabase.
   */
  static async getAllWebProjects(): Promise<WebProjectItem[]> {
    const now = Date.now();
    if (cachedWebProjects !== null && now - lastCacheTimestamp < CACHE_TTL_MS) {
      return cachedWebProjects;
    }

    if (pendingFetchPromise) {
      return pendingFetchPromise;
    }

    pendingFetchPromise = (async () => {
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
        cachedWebProjects = mapped;
        lastCacheTimestamp = Date.now();
        return mapped;
      } catch (err) {
        console.error("Gagal membaca projek web dari database Supabase:", err);
        if (cachedWebProjects !== null) return cachedWebProjects;
        return [];
      } finally {
        pendingFetchPromise = null;
      }
    })();

    return pendingFetchPromise;
  }

  /**
   * Mengambil satu projek web berdasarkan ID.
   */
  static async getWebProjectById(id: string): Promise<WebProjectItem | null> {
    if (cachedWebProjects !== null) {
      const found = cachedWebProjects.find((item) => item.id === id);
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
      if (cachedWebProjects !== null) {
        cachedWebProjects = [item, ...cachedWebProjects.filter((p) => p.id !== id)];
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
    if (cachedWebProjects !== null) {
      cachedWebProjects = [newItem, ...cachedWebProjects.filter((p) => p.id !== newItem.id)];
    } else {
      cachedWebProjects = [newItem];
    }
    lastCacheTimestamp = Date.now();

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
    if (cachedWebProjects !== null) {
      const idx = cachedWebProjects.findIndex((p) => p.id === id);
      if (idx >= 0) {
        cachedWebProjects[idx] = updatedItem;
      } else {
        cachedWebProjects = [updatedItem, ...cachedWebProjects];
      }
    }
    lastCacheTimestamp = Date.now();

    return updatedItem;
  }

  /**
   * Menghapus projek web berdasarkan ID.
   */
  static async deleteWebProject(id: string): Promise<boolean> {
    if (cachedWebProjects !== null) {
      cachedWebProjects = cachedWebProjects.filter((p) => p.id !== id);
    }
    lastCacheTimestamp = Date.now();

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
}
