import { prisma } from "@/lib/prisma";
import { AppItem, AppVersionItem, CreateAppInput } from "@/types/store";

const MAX_VERSIONS_PER_APP = 4;

/**
 * In-memory cache untuk mengurangi frekuensi query ke database Supabase.
 */
let cachedApps: AppItem[] | null = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 60_000;
let pendingFetchPromise: Promise<AppItem[]> | null = null;

/**
 * Helper auto-retry query jika ada gangguan koneksi transien ke Supabase.
 * Delay eksponensial: 300ms, 600ms, dst.
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
          `[Prisma Retry] Percobaan ke-${attempt + 1} setelah error: ${msg.slice(0, 80)}`
        );
        await new Promise((r) => setTimeout(r, 300 * attempt));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Service Layer untuk Akses Data Aplikasi di Supabase PostgreSQL melalui Prisma ORM.
 *
 * Menerapkan pola:
 * - In-memory cache dengan TTL 60 detik
 * - Single-flight de-duplication (hanya satu query berjalan bersamaan)
 * - Auto-retry untuk koneksi transien
 * - Select eksplisit agar query lebih ringan
 */
export class AppStorageService {
  /**
   * Kolom yang di-select secara eksplisit.
   * Menghindari SELECT * agar payload lebih kecil dan query lebih cepat.
   */
  private static readonly APP_SELECT = {
    id: true,
    name: true,
    tagline: true,
    description: true,
    longDescription: true,
    category: true,
    rating: true,
    reviewsCount: true,
    fileSize: true,
    version: true,
    developer: true,
    lastUpdated: true,
    platforms: true,
    iconUrl: true,
    iconType: true,
    iconColor: true,
    features: true,
    screenshots: true,
    downloadsCount: true,
    systemRequirements: true,
    apkUrl: true,
    apkFileName: true,
    createdAt: true,
  } as const;

  /**
   * Mengonversi record database Prisma ke interface AppItem.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToAppItem(record: any): AppItem {
    return {
      id: record.id,
      name: record.name,
      tagline: record.tagline || record.name,
      description: record.description,
      longDescription: record.longDescription || record.description,
      category: record.category as AppItem["category"],
      rating: typeof record.rating === "number" ? record.rating : 5.0,
      reviewsCount: record.reviewsCount || "Baru",
      fileSize: record.fileSize || "15.0 MB",
      version: record.version || "1.0.0",
      developer: record.developer || "AppHub Studio",
      lastUpdated: record.lastUpdated || "Baru saja",
      platforms: (record.platforms as AppItem["platforms"]) || ["android"],
      iconUrl: record.iconUrl || undefined,
      iconType: (record.iconType as AppItem["iconType"]) || "document",
      iconColor: record.iconColor || "bg-blue-500",
      features: record.features || [],
      screenshots: (record.screenshots as unknown as AppItem["screenshots"]) || [],
      downloadsCount: record.downloadsCount || "10 rb+",
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
   * Membersihkan cache agar query berikutnya mengambil data segar dari database.
   */
  static invalidateCache(): void {
    cachedApps = null;
    lastCacheTimestamp = 0;
    pendingFetchPromise = null;
  }

  /**
   * Mengambil semua daftar aplikasi yang ada di database Supabase.
   * Menggunakan single-flight de-duplication dan memory caching.
   */
  static async getAllApps(): Promise<AppItem[]> {
    const now = Date.now();

    if (cachedApps !== null && now - lastCacheTimestamp < CACHE_TTL_MS) {
      return cachedApps;
    }

    if (pendingFetchPromise) {
      return pendingFetchPromise;
    }

    pendingFetchPromise = (async () => {
      try {
        const records = await withRetry(() =>
          prisma.app.findMany({
            select: this.APP_SELECT,
            orderBy: { createdAt: "desc" },
          })
        );

        const mapped = records.map(this.mapToAppItem);
        cachedApps = mapped;
        lastCacheTimestamp = Date.now();
        return mapped;
      } catch (err) {
        console.error("Gagal membaca daftar aplikasi dari Supabase:", err);
        if (cachedApps !== null) return cachedApps;
        return [];
      } finally {
        pendingFetchPromise = null;
      }
    })();

    return pendingFetchPromise;
  }

  /**
   * Mengambil satu aplikasi berdasarkan ID.
   */
  static async getAppById(id: string): Promise<AppItem | null> {
    if (cachedApps !== null) {
      const found = cachedApps.find((a) => a.id === id);
      if (found) return found;
    }

    try {
      const record = await withRetry(() =>
        prisma.app.findUnique({
          select: this.APP_SELECT,
          where: { id },
        })
      );
      if (record) {
        const item = this.mapToAppItem(record);
        if (cachedApps !== null) {
          cachedApps = [item, ...cachedApps.filter((a) => a.id !== id)];
        }
        return item;
      }
      return null;
    } catch (err) {
      console.error(`Gagal membaca aplikasi ${id} dari Supabase:`, err);
      return null;
    }
  }

  /**
   * Menambahkan aplikasi APK baru ke database Supabase dan memperbarui cache.
   */
  static async createApp(appData: CreateAppInput): Promise<AppItem> {
    const lastUpdated =
      appData.lastUpdated ||
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const record = await withRetry(() =>
      prisma.app.create({
        data: {
          id: appData.id,
          name: appData.name,
          tagline: appData.tagline || appData.name,
          description: appData.description,
          longDescription: appData.longDescription || appData.description,
          category: appData.category,
          rating: typeof appData.rating === "number" ? appData.rating : 5.0,
          reviewsCount: appData.reviewsCount || "Baru",
          fileSize: appData.fileSize || "15.0 MB",
          version: appData.version || "1.0.0",
          developer: appData.developer || "AppHub Studio",
          lastUpdated,
          platforms: appData.platforms || ["android"],
          iconUrl: appData.iconUrl || null,
          iconType: appData.iconType || "document",
          iconColor: appData.iconColor || "bg-blue-500",
          features: appData.features || [],
          screenshots: JSON.parse(JSON.stringify(appData.screenshots || [])),
          downloadsCount: appData.downloadsCount || "10 rb+",
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
      })
    );

    const newItem = this.mapToAppItem(record);

    if (cachedApps !== null) {
      cachedApps = [newItem, ...cachedApps.filter((a) => a.id !== newItem.id)];
    } else {
      cachedApps = [newItem];
    }
    lastCacheTimestamp = Date.now();

    return newItem;
  }

  /**
   * Memperbarui data aplikasi di Supabase dan memperbarui cache.
   * Jika ada file APK baru (apkUrl berubah), versi lama otomatis diarsipkan
   * ke tabel app_versions sebelum data utama diperbarui.
   */
  static async updateApp(
    id: string,
    updateData: Partial<AppItem> & { changelog?: string }
  ): Promise<AppItem | null> {
    const lastUpdated =
      updateData.lastUpdated ||
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    // Ambil data aplikasi yang ada saat ini untuk membandingkan perubahan berkas atau versi
    const existingApp = await withRetry(() =>
      prisma.app.findUnique({
        where: { id },
        select: { apkUrl: true, apkFileName: true, version: true, fileSize: true },
      })
    );

    const hasNewApk = !!updateData.apkUrl;
    const isApkUrlChanged =
      hasNewApk &&
      !!existingApp?.apkUrl &&
      updateData.apkUrl !== existingApp.apkUrl;

    const isVersionChanged =
      !!updateData.version &&
      !!existingApp?.version &&
      updateData.version.trim() !== existingApp.version.trim();

    // Arsipkan jika berkas APK baru diunggah ATAU nomor versi diubah saat APK lama tersedia
    const shouldArchive =
      (isApkUrlChanged || isVersionChanged) &&
      !!existingApp?.apkUrl &&
      !!existingApp?.apkFileName;

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
    // Hapus field yang bukan kolom database
    delete dataToUpdate.id;
    delete dataToUpdate.versions;
    delete dataToUpdate.changelog;

    // Jalankan archive + update dalam satu transaction
    const record = await withRetry(async () => {
      if (shouldArchive && existingApp?.apkUrl && existingApp?.apkFileName) {
        return prisma.$transaction(async (tx) => {
          // 1. Arsipkan versi lama
          await tx.appVersion.create({
            data: {
              appId: id,
              version: existingApp.version,
              fileSize: existingApp.fileSize,
              apkUrl: existingApp.apkUrl!,
              apkFileName: existingApp.apkFileName!,
              changelog: updateData.changelog || "",
            },
          });

          // 2. Hapus versi terlama jika melebihi batas
          const allVersions = await tx.appVersion.findMany({
            where: { appId: id },
            orderBy: { createdAt: "desc" },
            select: { id: true },
          });
          if (allVersions.length > MAX_VERSIONS_PER_APP) {
            const idsToDelete = allVersions
              .slice(MAX_VERSIONS_PER_APP)
              .map((v) => v.id);
            await tx.appVersion.deleteMany({
              where: { id: { in: idsToDelete } },
            });
          }

          // 3. Update data aplikasi utama
          return tx.app.update({
            where: { id },
            data: dataToUpdate,
          });
        });
      }

      return prisma.app.update({
        where: { id },
        data: dataToUpdate,
      });
    });

    const updatedItem = this.mapToAppItem(record);

    if (cachedApps !== null) {
      const idx = cachedApps.findIndex((a) => a.id === id);
      if (idx >= 0) {
        cachedApps[idx] = updatedItem;
      } else {
        cachedApps = [updatedItem, ...cachedApps];
      }
    }
    lastCacheTimestamp = Date.now();

    return updatedItem;
  }

  /**
   * Menghapus aplikasi berdasarkan ID dari Supabase dan menghapusnya dari cache.
   */
  static async deleteApp(id: string): Promise<boolean> {
    if (cachedApps !== null) {
      cachedApps = cachedApps.filter((a) => a.id !== id);
    }
    lastCacheTimestamp = Date.now();

    try {
      await withRetry(() =>
        prisma.app.delete({
          where: { id },
        })
      );
      return true;
    } catch (err) {
      console.error(`Gagal menghapus aplikasi ${id} di Supabase:`, err);
      return false;
    }
  }

  /**
   * Mengambil metrik statistik ringkas untuk admin dashboard.
   */
  static async getStats() {
    const apps = await this.getAllApps();
    const totalApps = apps.length;

    const totalStorageMb = apps.reduce((acc, app) => {
      const mb = parseFloat(app.fileSize.replace(/[^0-9.]/g, "")) || 0;
      return acc + mb;
    }, 0);

    return {
      totalApps,
      totalStorageFormatted: `${totalStorageMb.toFixed(1)} MB`,
      totalDownloadsEst: totalApps > 0 ? "1.2M+" : "0",
      latestUpdated: apps[0]?.lastUpdated || "-",
      categoriesCount: Array.from(new Set(apps.map((a) => a.category))).length,
    };
  }

  /**
   * Mengambil daftar semua versi APK untuk satu aplikasi,
   * diurutkan dari yang terbaru.
   */
  static async getVersionsByAppId(appId: string): Promise<AppVersionItem[]> {
    try {
      const records = await withRetry(() =>
        prisma.appVersion.findMany({
          where: { appId },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            version: true,
            fileSize: true,
            apkUrl: true,
            apkFileName: true,
            changelog: true,
            createdAt: true,
          },
        })
      );

      return records.map((r) => ({
        id: r.id,
        version: r.version,
        fileSize: r.fileSize,
        apkUrl: r.apkUrl,
        apkFileName: r.apkFileName,
        changelog: r.changelog,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error(`Gagal membaca riwayat versi untuk ${appId}:`, err);
      return [];
    }
  }

  /**
   * Menghapus satu versi APK dari riwayat berdasarkan ID.
   */
  static async deleteVersion(versionId: string): Promise<boolean> {
    try {
      await withRetry(() =>
        prisma.appVersion.delete({
          where: { id: versionId },
        })
      );
      return true;
    } catch (err) {
      console.error(`Gagal menghapus versi ${versionId}:`, err);
      return false;
    }
  }
}
