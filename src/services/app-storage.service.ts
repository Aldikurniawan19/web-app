import { prisma } from "@/lib/prisma";
import { AppItem, CreateAppInput } from "@/types/store";
import { APP_STORE_ITEMS } from "@/constants/app-store-data";

/**
 * In-memory cache untuk performa tinggi & respon instan (sub-millisecond)
 */
let cachedApps: AppItem[] | null = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 detik cache TTL

let isSeededChecked = false;

/**
 * Service Layer untuk Akses Data Aplikasi di Supabase PostgreSQL melalui Prisma ORM
 */
export class AppStorageService {
  /**
   * Helper untuk memastikan database memiliki data katalog awal (seed fallback)
   * Hanya dijalankan 1 kali saat server startup / first request untuk menghemat roundtrip query ke database
   */
  private static async ensureSeeded(): Promise<void> {
    if (isSeededChecked) return;

    try {
      isSeededChecked = true;
      const count = await prisma.app.count();
      if (count === 0) {
        // Lakukan batch seeding cepat
        const seedData = APP_STORE_ITEMS.map((item) => ({
          id: item.id,
          name: item.name,
          tagline: item.tagline,
          description: item.description,
          longDescription: item.longDescription,
          category: item.category,
          rating: item.rating,
          reviewsCount: item.reviewsCount,
          fileSize: item.fileSize,
          version: item.version,
          developer: item.developer,
          lastUpdated: item.lastUpdated,
          platforms: item.platforms,
          iconUrl: item.iconUrl || null,
          iconType: item.iconType,
          iconColor: item.iconColor,
          features: item.features,
          screenshots: JSON.parse(JSON.stringify(item.screenshots)),
          downloadsCount: item.downloadsCount,
          systemRequirements: JSON.parse(JSON.stringify(item.systemRequirements)),
          apkUrl: item.apkUrl || `/downloads/aerosync-v2.4.0-release.apk`,
          apkFileName: item.apkFileName || `${item.id}-v${item.version}.apk`,
        }));

        await prisma.app.createMany({
          data: seedData,
          skipDuplicates: true,
        });
      }
    } catch (err) {
      console.warn("Peringatan saat memeriksa database seed Supabase:", err);
    }
  }

  /**
   * Mengonversi record database Prisma ke interface AppItem
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToAppItem(record: any): AppItem {
    return {
      id: record.id,
      name: record.name,
      tagline: record.tagline,
      description: record.description,
      longDescription: record.longDescription,
      category: record.category as AppItem["category"],
      rating: record.rating,
      reviewsCount: record.reviewsCount,
      fileSize: record.fileSize,
      version: record.version,
      developer: record.developer,
      lastUpdated: record.lastUpdated,
      platforms: (record.platforms as AppItem["platforms"]) || ["android"],
      iconUrl: record.iconUrl || undefined,
      iconType: (record.iconType as AppItem["iconType"]) || "document",
      iconColor: record.iconColor || "bg-blue-500",
      features: record.features || [],
      screenshots: (record.screenshots as unknown as AppItem["screenshots"]) || [],
      downloadsCount: record.downloadsCount,
      systemRequirements: (record.systemRequirements as unknown as AppItem["systemRequirements"]) || {
        os: "Android 8.0+",
        ram: "2 GB RAM",
        storage: "50 MB",
      },
      apkUrl: record.apkUrl || undefined,
      apkFileName: record.apkFileName || undefined,
    };
  }

  /**
   * Invalidate in-memory cache saat ada mutasi data
   */
  static invalidateCache(): void {
    cachedApps = null;
    lastCacheTimestamp = 0;
  }

  /**
   * Mengambil semua daftar aplikasi yang tersedia di Supabase dengan In-Memory Cache Cepat
   */
  static async getAllApps(): Promise<AppItem[]> {
    const now = Date.now();

    // 1. Jika data ada di cache dan belum expired, kembalikan instan (0ms latency)
    if (cachedApps && now - lastCacheTimestamp < CACHE_TTL_MS) {
      return cachedApps;
    }

    try {
      await this.ensureSeeded();

      const records = await prisma.app.findMany({
        orderBy: { createdAt: "desc" },
      });

      if (records.length === 0) {
        cachedApps = APP_STORE_ITEMS;
        lastCacheTimestamp = now;
        return APP_STORE_ITEMS;
      }

      const mapped = records.map(this.mapToAppItem);
      cachedApps = mapped;
      lastCacheTimestamp = now;
      return mapped;
    } catch (err) {
      console.error("Gagal membaca daftar aplikasi dari Supabase:", err);
      if (cachedApps) return cachedApps;
      return APP_STORE_ITEMS;
    }
  }

  /**
   * Mengambil satu aplikasi berdasarkan ID (Pencarian Cepat di Cache atau DB)
   */
  static async getAppById(id: string): Promise<AppItem | null> {
    // 1. Cek dari cache jika tersedia
    if (cachedApps) {
      const foundInCache = cachedApps.find((a) => a.id === id);
      if (foundInCache) return foundInCache;
    }

    try {
      await this.ensureSeeded();
      const record = await prisma.app.findUnique({
        where: { id },
      });

      if (!record) {
        const fallback = APP_STORE_ITEMS.find((a) => a.id === id);
        return fallback || null;
      }

      return this.mapToAppItem(record);
    } catch (err) {
      console.error(`Gagal membaca aplikasi ${id} dari Supabase:`, err);
      const fallback = APP_STORE_ITEMS.find((a) => a.id === id);
      return fallback || null;
    }
  }

  /**
   * Menambahkan aplikasi APK baru ke database Supabase & memperbarui cache instan
   */
  static async createApp(appData: CreateAppInput): Promise<AppItem> {
    const lastUpdated =
      appData.lastUpdated ||
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const record = await prisma.app.create({
      data: {
        id: appData.id,
        name: appData.name,
        tagline: appData.tagline,
        description: appData.description,
        longDescription: appData.longDescription,
        category: appData.category,
        rating: appData.rating ?? 5.0,
        reviewsCount: appData.reviewsCount ?? "Baru",
        fileSize: appData.fileSize,
        version: appData.version,
        developer: appData.developer,
        lastUpdated,
        platforms: appData.platforms || ["android"],
        iconUrl: appData.iconUrl || null,
        iconType: appData.iconType || "document",
        iconColor: appData.iconColor || "bg-blue-500",
        features: appData.features || [],
        screenshots: JSON.parse(JSON.stringify(appData.screenshots || [])),
        downloadsCount: appData.downloadsCount ?? "0+",
        systemRequirements: JSON.parse(
          JSON.stringify(
            appData.systemRequirements || {
              os: "Android 8.0+",
              ram: "2 GB RAM",
              storage: "50 MB",
            }
          )
        ),
        apkUrl: appData.apkUrl || null,
        apkFileName: appData.apkFileName || null,
      },
    });

    // Invalidate cache agar data terbaru langsung tersinkron
    this.invalidateCache();

    return this.mapToAppItem(record);
  }

  /**
   * Memperbarui data aplikasi di Supabase & memperbarui cache instan
   */
  static async updateApp(id: string, updateData: Partial<AppItem>): Promise<AppItem | null> {
    const lastUpdated =
      updateData.lastUpdated ||
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: any = {
      ...updateData,
      lastUpdated,
    };

    if (updateData.screenshots) {
      dataToUpdate.screenshots = JSON.parse(JSON.stringify(updateData.screenshots));
    }
    if (updateData.systemRequirements) {
      dataToUpdate.systemRequirements = JSON.parse(JSON.stringify(updateData.systemRequirements));
    }
    delete dataToUpdate.id; // Hindari manipulasi ID

    const record = await prisma.app.update({
      where: { id },
      data: dataToUpdate,
    });

    // Invalidate cache
    this.invalidateCache();

    return this.mapToAppItem(record);
  }

  /**
   * Menghapus aplikasi berdasarkan ID dari Supabase & memperbarui cache instan
   */
  static async deleteApp(id: string): Promise<boolean> {
    try {
      await prisma.app.delete({
        where: { id },
      });

      // Invalidate cache
      this.invalidateCache();
      return true;
    } catch (err) {
      console.error(`Gagal menghapus aplikasi ${id} di Supabase:`, err);
      return false;
    }
  }

  /**
   * Mengambil metrik statistik ringkas untuk admin dashboard
   */
  static async getStats() {
    const apps = await this.getAllApps();
    const totalApps = apps.length;

    // Hitung total estimasi ukuran penyimpanan APK
    const totalStorageMb = apps.reduce((acc, app) => {
      const mb = parseFloat(app.fileSize.replace(/[^0-9.]/g, "")) || 0;
      return acc + mb;
    }, 0);

    return {
      totalApps,
      totalStorageFormatted: `${totalStorageMb.toFixed(1)} MB`,
      totalDownloadsEst: "1.2M+",
      latestUpdated: apps[0]?.lastUpdated || "-",
      categoriesCount: Array.from(new Set(apps.map((a) => a.category))).length,
    };
  }
}
