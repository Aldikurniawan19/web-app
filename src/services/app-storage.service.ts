import { prisma } from "@/lib/prisma";
import { AppItem, AppVersionItem, CreateAppInput, ReleaseNewVersionInput } from "@/types/store";
import { GithubReleaseService } from "./github-release.service";
import { ApkSecurityService } from "./apk-security.service";
import { decodeDataImageUri, DecodedImageData } from "@/lib/media-decode";

const MAX_VERSIONS_PER_APP = 4;
const GITHUB_STATS_TIMEOUT_MS = 2_000;

/**
 * In-memory cache untuk mengurangi frekuensi query ke database Supabase.
 */
let cachedApps: AppItem[] | null = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 60_000;
let pendingFetchPromise: Promise<AppItem[]> | null = null;
const mediaVersionMap = new Map<string, string>();

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

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
    updatedAt: true,
  } as const;

  /**
   * Mengonversi record database Prisma ke interface AppItem.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToAppItem(record: any): AppItem {
    const stampSource = record.updatedAt || record.createdAt;
    const versionStamp = stampSource
      ? new Date(stampSource).getTime().toString(36)
      : "1";
    mediaVersionMap.set(record.id, versionStamp);

    const apkFile = record.apkFileName || `${record.id}-v${record.version || "1.0.0"}.apk`;
    // Prioritaskan URL GitHub Releases resmi
    const defaultGithubUrl = `https://github.com/Aldikurniawan19/app-release/releases/download/apk-releases/${apkFile}`;
    const resolvedApkUrl =
      record.apkUrl && !record.apkUrl.startsWith("/downloads/")
        ? record.apkUrl
        : defaultGithubUrl;

    return {
      id: record.id,
      name: record.name,
      tagline: record.tagline || record.name,
      description: record.description,
      longDescription: record.longDescription || record.description,
      category: (record.category as AppItem["category"]) || "Produktivitas",
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
      apkUrl: resolvedApkUrl,
      apkFileName: apkFile,
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

        // Lampirkan ringkasan scan keamanan APK dalam 1 query batch (menghindari N+1)
        const scanMap = await ApkSecurityService.getLatestScansMapForApps(
          mapped.map((a) => ({ id: a.id, version: a.version }))
        );
        for (const app of mapped) {
          if (scanMap[app.id]) {
            app.securityScan = scanMap[app.id];
          }
        }

        // Sinkronkan downloadsCount & URL GitHub Releases dengan batas waktu aman agar tidak memblokir SSR/API
        try {
          const statsMap = await withTimeout(
            GithubReleaseService.getAllAppsDownloadStats(
              mapped.map((a) => ({
                id: a.id,
                name: a.name,
                apkFileName: a.apkFileName,
                apkUrl: a.apkUrl,
              }))
            ),
            GITHUB_STATS_TIMEOUT_MS
          );
          if (statsMap) {
            for (const app of mapped) {
              const stats = statsMap[app.id];
              if (stats) {
                if (stats.totalDownloads > 0) {
                  app.downloadsCount = stats.formattedTotal;
                }
                if (!app.apkUrl && stats.latestDownloadUrl) {
                  app.apkUrl = stats.latestDownloadUrl;
                }
              }
            }
          }
        } catch {
          // Tetap gunakan fallback downloadsCount dari database jika API GitHub lambat atau gagal
        }

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

        const scanMap = await ApkSecurityService.getLatestScansMapForApps([
          { id: item.id, version: item.version },
        ]);
        if (scanMap[item.id]) {
          item.securityScan = scanMap[item.id];
        }

        // Sinkronkan downloadsCount aktual & URL GitHub Releases dari akumulasi unduhan seluruh rilis GitHub
        try {
          const stats = await withTimeout(
            GithubReleaseService.getAppDownloadStats({
              appId: item.id,
              appName: item.name,
              apkFileName: item.apkFileName,
              apkUrl: item.apkUrl,
            }),
            GITHUB_STATS_TIMEOUT_MS
          );
          if (stats) {
            if (stats.totalDownloads > 0) {
              item.downloadsCount = stats.formattedTotal;
            }
            if (!item.apkUrl && stats.latestDownloadUrl) {
              item.apkUrl = stats.latestDownloadUrl;
            }
          }
        } catch {}

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

    if (!existingApp) {
      return null;
    }

    const hasNewApk = Boolean(updateData.apkUrl);
    const isApkUrlChanged =
      hasNewApk &&
      Boolean(existingApp.apkUrl) &&
      updateData.apkUrl !== existingApp.apkUrl;

    const isVersionChanged =
      Boolean(updateData.version) &&
      Boolean(existingApp.version) &&
      updateData.version!.trim() !== existingApp.version.trim();

    // Arsipkan jika berkas APK baru diunggah ATAU nomor versi diubah saat APK lama tersedia
    const shouldArchive =
      (isApkUrlChanged || isVersionChanged) &&
      Boolean(existingApp.apkUrl) &&
      Boolean(existingApp.apkFileName);

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
    delete dataToUpdate.securityScan;

    // 1. Jika perlu mengarsipkan versi lama, simpan ke tabel app_versions
    if (shouldArchive && existingApp.apkUrl && existingApp.apkFileName) {
      try {
        await withRetry(() =>
          prisma.appVersion.create({
            data: {
              appId: id,
              version: existingApp.version,
              fileSize: existingApp.fileSize,
              apkUrl: existingApp.apkUrl!,
              apkFileName: existingApp.apkFileName!,
              changelog: updateData.changelog || "",
            },
          })
        );

        // Bersihkan versi lama jika melebihi batas maksimal
        const allVersions = await prisma.appVersion.findMany({
          where: { appId: id },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });
        if (allVersions.length > MAX_VERSIONS_PER_APP) {
          const idsToDelete = allVersions
            .slice(MAX_VERSIONS_PER_APP)
            .map((v) => v.id);
          await prisma.appVersion.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }
      } catch (archiveErr) {
        console.warn("Peringatan: Gagal mengarsipkan versi lama:", archiveErr);
      }
    }

    // 2. Perbarui data aplikasi utama secara langsung tanpa interactive transaction timeout
    const record = await withRetry(() =>
      prisma.app.update({
        where: { id },
        data: dataToUpdate,
      })
    );

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
   * Mengunggah / Menerbitkan versi baru aplikasi secara manual dengan tautan berkas dari GitHub Action.
   * Versi lama otomatis diarsipkan ke tabel app_versions beserta riwayat changelog.
   */
  static async releaseNewVersion(params: ReleaseNewVersionInput): Promise<AppItem> {
    const { appId, version, apkUrl } = params;

    const existingApp = await withRetry(() =>
      prisma.app.findUnique({
        where: { id: appId },
        select: {
          id: true,
          name: true,
          version: true,
          apkUrl: true,
          apkFileName: true,
          fileSize: true,
        },
      })
    );

    if (!existingApp) {
      throw new Error(`Aplikasi dengan ID '${appId}' tidak ditemukan.`);
    }

    const cleanVersion = version.trim().replace(/^v/i, "");
    const cleanUrl = apkUrl.trim();

    // Tentukan nama berkas APK
    let derivedFileName = params.apkFileName?.trim() || "";
    if (!derivedFileName) {
      try {
        const urlObj = new URL(cleanUrl);
        const lastPart = urlObj.pathname.split("/").pop();
        if (lastPart && lastPart.toLowerCase().endsWith(".apk")) {
          derivedFileName = decodeURIComponent(lastPart.split("?")[0]);
        }
      } catch {
        // abaikan jika bukan URL standar
      }
    }
    if (!derivedFileName) {
      derivedFileName = `${existingApp.id}-v${cleanVersion}.apk`;
    }

    const cleanFileSize = params.fileSize?.trim() || existingApp.fileSize || "15.0 MB";
    const lastUpdated =
      params.lastUpdated?.trim() ||
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    // 1. Simpan versi aktif sebelumnya ke dalam riwayat app_versions
    if (existingApp.apkUrl && existingApp.version) {
      try {
        await withRetry(() =>
          prisma.appVersion.create({
            data: {
              appId,
              version: existingApp.version,
              fileSize: existingApp.fileSize,
              apkUrl: existingApp.apkUrl!,
              apkFileName: existingApp.apkFileName || `${appId}-v${existingApp.version}.apk`,
              changelog: params.changelog?.trim() || "Pembaruan rilis versi stabil.",
            },
          })
        );

        // Batasi riwayat versi maksimal 4 versi tersimpan
        const allVersions = await prisma.appVersion.findMany({
          where: { appId },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });

        if (allVersions.length > MAX_VERSIONS_PER_APP) {
          const idsToDelete = allVersions.slice(MAX_VERSIONS_PER_APP).map((v) => v.id);
          await prisma.appVersion.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }
      } catch (archiveErr) {
        console.warn("Peringatan: Gagal mengarsipkan versi lama:", archiveErr);
      }
    }

    // 2. Perbarui data rilis aktif pada tabel utama app
    const updatedRecord = await withRetry(() =>
      prisma.app.update({
        where: { id: appId },
        data: {
          version: cleanVersion,
          apkUrl: cleanUrl,
          apkFileName: derivedFileName,
          fileSize: cleanFileSize,
          lastUpdated,
        },
      })
    );

    this.invalidateCache();
    return this.mapToAppItem(updatedRecord);
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

      const versionScansMap = await ApkSecurityService.getVersionScansMap(appId);

      return records.map((r) => {
        const apkFile = r.apkFileName || `${appId}-${r.version}.apk`;
        const defaultGithubUrl = `https://github.com/Aldikurniawan19/app-release/releases/download/apk-releases/${apkFile}`;
        const resolvedApkUrl =
          r.apkUrl && !r.apkUrl.startsWith("/downloads/") ? r.apkUrl : defaultGithubUrl;
        const cleanVer = r.version.trim().replace(/^v/i, "");

        return {
          id: r.id,
          version: r.version,
          fileSize: r.fileSize,
          apkUrl: resolvedApkUrl,
          apkFileName: apkFile,
          changelog: r.changelog,
          createdAt: r.createdAt.toISOString(),
          securityScan: versionScansMap[cleanVer],
        };
      });
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

  /**
   * Mengembalikan daftar aplikasi ringan untuk halaman publik & SSR dengan ikon/screenshot base64
   * dialihkan ke endpoint media biner agar JSON & HTML awal tetap berukuran beberapa KB saja.
   */
  static async getPublicCatalogApps(): Promise<AppItem[]> {
    const apps = await this.getAllApps();
    return apps.map((app) => {
      const vTag = mediaVersionMap.get(app.id) || "1";
      const safeId = encodeURIComponent(app.id);

      const slimIconUrl =
        app.iconUrl && app.iconUrl.trim().startsWith("data:image/")
          ? `/api/apps/media/${safeId}/icon/0?v=${vTag}`
          : app.iconUrl;

      const slimScreenshots = Array.isArray(app.screenshots)
        ? app.screenshots.map((sc, idx) => {
            if (!sc || typeof sc.imageUrl !== "string") return sc;
            if (!sc.imageUrl.trim().startsWith("data:image/")) return sc;
            return {
              ...sc,
              imageUrl: `/api/apps/media/${safeId}/screenshot/${idx}?v=${vTag}`,
            };
          })
        : [];

      return {
        ...app,
        longDescription: app.description,
        iconUrl: slimIconUrl,
        screenshots: slimScreenshots,
      };
    });
  }

  /**
   * Mengambil data biner ikon atau screenshot aplikasi untuk endpoint media cacheable.
   */
  static async getAppMediaBinary(
    appId: string,
    kind: "icon" | "screenshot",
    slot: string
  ): Promise<DecodedImageData | { redirectUrl: string } | null> {
    let iconUrl: string | null | undefined;
    let screenshots: AppItem["screenshots"] = [];

    if (cachedApps) {
      const cached = cachedApps.find((a) => a.id === appId);
      if (cached) {
        iconUrl = cached.iconUrl;
        screenshots = cached.screenshots;
      }
    }

    if (iconUrl === undefined && screenshots.length === 0) {
      const record = await withRetry(() =>
        prisma.app.findUnique({
          where: { id: appId },
          select: { iconUrl: true, screenshots: true },
        })
      );
      if (!record) return null;
      iconUrl = record.iconUrl;
      screenshots =
        (record.screenshots as unknown as AppItem["screenshots"]) || [];
    }

    let rawImageUrl: string | undefined;
    if (kind === "icon") {
      rawImageUrl = iconUrl || undefined;
    } else if (Array.isArray(screenshots)) {
      if (/^\d+$/.test(slot)) {
        rawImageUrl = screenshots[Number(slot)]?.imageUrl;
      } else {
        rawImageUrl = screenshots.find((s) => s?.id === slot)?.imageUrl;
      }
    }

    if (!rawImageUrl) return null;
    const decoded = decodeDataImageUri(rawImageUrl);
    if (decoded) return decoded;
    return { redirectUrl: rawImageUrl };
  }
}
