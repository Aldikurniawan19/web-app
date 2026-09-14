import { prisma } from "@/lib/prisma";
import { AppItem, CreateAppInput } from "@/types/store";
import { APP_STORE_ITEMS } from "@/constants/app-store-data";

/**
 * Service Layer untuk Akses Data Aplikasi di Supabase PostgreSQL melalui Prisma ORM
 */
export class AppStorageService {
  /**
   * Helper untuk memastikan database memiliki data katalog awal (seed fallback)
   */
  private static async ensureSeeded(): Promise<void> {
    try {
      const count = await prisma.app.count();
      if (count === 0) {
        // Lakukan auto-seeding dari konstanta awal
        for (const item of APP_STORE_ITEMS) {
          await prisma.app.create({
            data: {
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
            },
          });
        }
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
   * Mengambil semua daftar aplikasi yang tersedia di Supabase
   */
  static async getAllApps(): Promise<AppItem[]> {
    try {
      await this.ensureSeeded();
      const records = await prisma.app.findMany({
        orderBy: { createdAt: "desc" },
      });

      if (records.length === 0) {
        return APP_STORE_ITEMS;
      }

      return records.map(this.mapToAppItem);
    } catch (err) {
      console.error("Gagal membaca daftar aplikasi dari Supabase:", err);
      return APP_STORE_ITEMS;
    }
  }

  /**
   * Mengambil satu aplikasi berdasarkan ID
   */
  static async getAppById(id: string): Promise<AppItem | null> {
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
   * Menambahkan aplikasi APK baru ke database Supabase
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

    return this.mapToAppItem(record);
  }

  /**
   * Memperbarui data aplikasi di Supabase
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

    return this.mapToAppItem(record);
  }

  /**
   * Menghapus aplikasi berdasarkan ID dari Supabase
   */
  static async deleteApp(id: string): Promise<boolean> {
    try {
      await prisma.app.delete({
        where: { id },
      });
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
