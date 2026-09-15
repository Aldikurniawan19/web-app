import fs from "fs";
import path from "path";

export interface GithubReleaseAssetResult {
  fileName: string;
  fileSize: string;
  fileSizeBytes: number;
  downloadUrl: string;
  assetId?: number;
  storageProvider: "github" | "local";
  warning?: string;
}

export class GithubReleaseService {
  private static get token(): string {
    return process.env.GITHUB_TOKEN || "";
  }

  private static get owner(): string {
    return process.env.GITHUB_REPO_OWNER || "Aldikurniawan19";
  }

  private static get repo(): string {
    return process.env.GITHUB_REPO_NAME || "app-release";
  }

  private static get tag(): string {
    return process.env.GITHUB_RELEASE_TAG || "apk-releases";
  }

  private static get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "AppHub-Store-Service",
    };
    if (this.token && this.token.trim().length > 0) {
      headers.Authorization = `Bearer ${this.token.trim()}`;
    }
    return headers;
  }

  /**
   * Memastikan tag release GitHub sudah tersedia di repositori
   */
  static async ensureRelease(): Promise<{
    id: number;
    upload_url: string;
    assets: Array<{ id: number; name: string }>;
  }> {
    // 1. Cek rilis berdasarkan tag
    const getUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/tags/${this.tag}`;

    const res = await fetch(getUrl, {
      headers: this.headers,
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
    }

    // 2. Cek apakah ada rilis dengan nama/tag serupa di daftar rilis
    if (res.status === 404) {
      const listUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/releases`;
      const listRes = await fetch(listUrl, {
        headers: this.headers,
        cache: "no-store",
      });

      if (listRes.ok) {
        const releases = await listRes.json();
        const found = Array.isArray(releases)
          ? releases.find((r: { tag_name: string }) => r.tag_name === this.tag)
          : null;
        if (found) {
          return found;
        }
      }

      // 3. Jika belum ada sama sekali, buat release baru
      const createUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/releases`;
      const createRes = await fetch(createUrl, {
        method: "POST",
        headers: {
          ...this.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag_name: this.tag,
          target_commitish: "main",
          name: "AppHub APK Storage Release",
          body: "Penyimpanan otomatis berkas rilis APK untuk AppHub Android Store.",
          draft: false,
          prerelease: false,
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(
          `Gagal membuat release baru di GitHub (${createRes.status}): ${errText}`
        );
      }

      return await createRes.json();
    }

    const errText = await res.text();
    throw new Error(`Gagal memeriksa release di GitHub (${res.status}): ${errText}`);
  }

  /**
   * Mengunggah berkas APK sebagai asset di GitHub Release (dengan fallback ke penyimpanan lokal)
   */
  static async uploadApkAsset(
    fileBuffer: Buffer | ArrayBuffer,
    originalFileName: string
  ): Promise<GithubReleaseAssetResult> {
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    const sanitizedName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
    const ext = path.extname(sanitizedName) || ".apk";
    const base = path.basename(sanitizedName, ext);
    // Tambahkan timestamp unik pada nama aset fisik agar berkas APK versi lama tidak tertimpa
    const uniqueAssetFileName = `${base}-${Date.now()}${ext}`;

    const sizeInBytes = buffer.length;
    const sizeInMb = (sizeInBytes / (1024 * 1024)).toFixed(1);
    const formattedSize = `${sizeInMb} MB`;

    // 1. Coba unggah ke GitHub Releases
    try {
      const release = await this.ensureRelease();

      // Jika sudah ada asset dengan nama unik yang sama, hapus terlebih dahulu
      if (Array.isArray(release.assets)) {
        const existingAsset = release.assets.find(
          (a) => a.name.toLowerCase() === uniqueAssetFileName.toLowerCase()
        );
        if (existingAsset) {
          try {
            const deleteUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/assets/${existingAsset.id}`;
            await fetch(deleteUrl, {
              method: "DELETE",
              headers: this.headers,
            });
          } catch (delErr) {
            console.warn("Peringatan: Gagal menghapus asset lama di GitHub Release:", delErr);
          }
        }
      }

      // Tentukan URL upload asset (gunakan template upload_url dari GitHub atau fallback URL upload resmi)
      const uploadUrlBase = release.upload_url
        ? release.upload_url.replace(/\{\?name,label\}/, "")
        : `https://uploads.github.com/repos/${this.owner}/${this.repo}/releases/${release.id}/assets`;

      const uploadUrl = `${uploadUrlBase}?name=${encodeURIComponent(uniqueAssetFileName)}`;

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          ...this.headers,
          "Content-Type": "application/vnd.android.package-archive",
          "Content-Length": sizeInBytes.toString(),
        },
        body: new Uint8Array(buffer),
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`GitHub Asset Upload Error (${uploadRes.status}): ${errText}`);
      }

      const assetData = await uploadRes.json();

      return {
        fileName: sanitizedName,
        fileSize: formattedSize,
        fileSizeBytes: sizeInBytes,
        downloadUrl:
          assetData.browser_download_url ||
          `https://github.com/${this.owner}/${this.repo}/releases/download/${this.tag}/${uniqueAssetFileName}`,
        assetId: assetData.id,
        storageProvider: "github",
      };
    } catch (githubErr: unknown) {
      const errMsg =
        githubErr instanceof Error ? githubErr.message : "Kegagalan komunikasi GitHub API";
      console.warn(
        "Peringatan: Gagal mengunggah ke GitHub Releases. Mengaktifkan fallback penyimpanan lokal:",
        errMsg
      );

      // Fallback: simpan berkas fisik ke public/downloads
      try {
        const downloadsDir = path.join(process.cwd(), "public", "downloads");
        if (!fs.existsSync(downloadsDir)) {
          fs.mkdirSync(downloadsDir, { recursive: true });
        }
        const filePath = path.join(downloadsDir, uniqueAssetFileName);
        fs.writeFileSync(filePath, buffer);
      } catch (fsErr) {
        console.warn("Gagal menulis fallback file ke disk:", fsErr);
      }

      return {
        fileName: sanitizedName,
        fileSize: formattedSize,
        fileSizeBytes: sizeInBytes,
        downloadUrl: `/downloads/${uniqueAssetFileName}`,
        storageProvider: "local",
        warning: `GitHub API error: ${errMsg}`,
      };
    }
  }

  // Cache in-memory untuk daftar rilis dari GitHub API agar hemat rate limit
  private static cachedReleases: any[] | null = null;
  private static lastReleasesCacheTime = 0;
  private static readonly RELEASES_CACHE_TTL_MS = 60_000;

  /**
   * Mengambil semua rilis dari repository GitHub Releases.
   * Endpoint: GET /repos/{owner}/{repo}/releases?per_page=100
   * Dilengkapi in-memory caching 60 detik.
   */
  static async fetchAllReleases(forceRefresh = false): Promise<any[]> {
    const now = Date.now();
    if (!forceRefresh && this.cachedReleases && now - this.lastReleasesCacheTime < this.RELEASES_CACHE_TTL_MS) {
      return this.cachedReleases;
    }

    try {
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/releases?per_page=100`;
      const res = await fetch(url, {
        headers: this.headers,
        cache: "no-store",
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[GitHub API] Gagal mengambil daftar rilis (${res.status}): ${errText}`);
        return this.cachedReleases || [];
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        this.cachedReleases = data;
        this.lastReleasesCacheTime = now;
        return data;
      }
      return [];
    } catch (err) {
      console.warn("[GitHub API] Error jaringan saat mengambil daftar rilis:", err);
      return this.cachedReleases || [];
    }
  }

  /**
   * Helper untuk mengekstrak versi dari tag rilis atau nama aset berkas
   */
  private static extractVersion(tag: string, assetName: string): string {
    // Coba temukan pola versi seperti v1.0.0 atau 1.0.0
    const tagMatch = tag.match(/v?(\d+\.\d+(\.\d+)?)/i);
    if (tagMatch) return tagMatch[1];

    const assetMatch = assetName.match(/v?(\d+\.\d+(\.\d+)?)/i);
    if (assetMatch) return assetMatch[1];

    return "";
  }

  /**
   * Format angka jumlah unduhan ke dalam format yang ramah dibaca (Bahasa Indonesia).
   * Contoh:
   * - 2 -> "2"
   * - 250 -> "250"
   * - 1500 -> "1.5 rb+"
   * - 15000 -> "15 rb+"
   * - 1200000 -> "1.2 jt+"
   */
  static formatDownloadCount(count: number): string {
    if (count <= 0) {
      return "0";
    }
    if (count < 1000) {
      return `${count}`;
    }
    if (count < 10000) {
      const formatted = (count / 1000).toFixed(1).replace(".0", "");
      return `${formatted} rb+`;
    }
    if (count < 1000000) {
      const formatted = Math.floor(count / 1000);
      return `${formatted} rb+`;
    }
    const formatted = (count / 1000000).toFixed(1).replace(".0", "");
    return `${formatted} jt+`;
  }

  /**
   * Logic Menghitung Jumlah Download per Aplikasi.
   *
   * Karena satu aplikasi bisa memiliki banyak release (satu per versi),
   * total download dihitung dengan menjumlahkan download_count dari SEMUA asset di SEMUA release yang termasuk aplikasi tersebut.
   *
   * Langkah logic:
   * 1. Fetch semua release dari repo: GET /repos/{owner}/{repo}/releases
   * 2. Filter release yang tag_name-nya diawali (startsWith) dengan githubTagPrefix milik app yang dicari
   *    (atau jika rilis berada di tag bersama seperti 'apk-releases', filter aset yang relevan dengan aplikasi)
   * 3. Dari release-release yang lolos filter, ambil semua assets
   * 4. Jumlahkan field download_count dari setiap asset -> hasilnya adalah total download aplikasi (gabungan semua versi)
   * 5. Menyediakan breakdown riwayat unduhan per versi
   */
  static async getAppDownloadStats(options: {
    appId: string;
    appName?: string;
    githubTagPrefix?: string;
    apkFileName?: string;
    apkUrl?: string;
  }): Promise<AppDownloadStatsResult> {
    const cleanAppId = options.appId.toLowerCase().trim();
    const tagPrefix = (options.githubTagPrefix || cleanAppId).toLowerCase();
    const cleanApkName = options.apkFileName?.toLowerCase().trim();
    const cleanAppName = options.appName?.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

    // Ambil nama berkas dari URL APK jika tersedia
    let apkUrlFileName = "";
    if (options.apkUrl) {
      try {
        const urlObj = new URL(options.apkUrl, "http://localhost");
        apkUrlFileName = path.basename(urlObj.pathname).toLowerCase().trim();
      } catch {
        apkUrlFileName = path.basename(options.apkUrl).toLowerCase().trim();
      }
    }

    // Nama dasar APK tanpa ekstensi .apk dan tanpa timestamp (-123456789)
    const cleanApkBase = cleanApkName
      ? path.basename(cleanApkName, path.extname(cleanApkName)).replace(/-\d+$/, "").trim()
      : "";

    // 1. Fetch semua release dari repo
    const releases = await this.fetchAllReleases();

    let totalDownloads = 0;
    const breakdown: AssetDownloadBreakdown[] = [];

    for (const rel of releases) {
      const tagLower = (rel.tag_name || "").toLowerCase().trim();
      const isTagMatch = tagLower.startsWith(tagPrefix) || (cleanAppName && tagLower.startsWith(cleanAppName));
      const isSharedTag = tagLower === this.tag.toLowerCase().trim();

      if (isTagMatch && !isSharedTag) {
        // Tag rilis diawali githubTagPrefix / app name -> ambil semua assets di release ini
        if (Array.isArray(rel.assets)) {
          for (const asset of rel.assets) {
            const count = typeof asset.download_count === "number" ? asset.download_count : 0;
            totalDownloads += count;

            breakdown.push({
              releaseId: rel.id,
              releaseTag: rel.tag_name,
              releaseName: rel.name || rel.tag_name,
              assetId: asset.id,
              assetName: asset.name,
              downloadCount: count,
              downloadUrl: asset.browser_download_url,
              version: this.extractVersion(rel.tag_name, asset.name),
              createdAt: asset.created_at || rel.created_at,
            });
          }
        }
      } else if (isSharedTag || isTagMatch) {
        // Jika rilis disimpan di tag bersama (misal 'apk-releases'), cocokkan aset secara fleksibel
        if (Array.isArray(rel.assets)) {
          for (const asset of rel.assets) {
            const assetNameLower = (asset.name || "").toLowerCase().trim();
            const assetBase = path
              .basename(assetNameLower, path.extname(assetNameLower))
              .replace(/-\d+$/, "")
              .trim();

            const isAssetMatch =
              // 1. Cocok persis dengan nama berkas di apkUrl (misal: aerosync-172641234.apk)
              Boolean(apkUrlFileName && assetNameLower === apkUrlFileName) ||
              // 2. Cocok persis dengan apkFileName
              Boolean(cleanApkName && assetNameLower === cleanApkName) ||
              // 3. Cocok nama dasar berkas APK (tanpa timestamp & ekstensi)
              Boolean(cleanApkBase && (assetBase === cleanApkBase || assetBase.startsWith(cleanApkBase) || cleanApkBase.startsWith(assetBase))) ||
              // 4. Awalan atau kemunculan ID aplikasi pada nama aset
              Boolean(cleanAppId && (assetNameLower.startsWith(cleanAppId) || assetBase.includes(cleanAppId))) ||
              // 5. Kemunculan nama aplikasi (slug)
              Boolean(cleanAppName && cleanAppName.length > 2 && (assetBase.includes(cleanAppName) || assetNameLower.startsWith(cleanAppName)));

            if (isAssetMatch) {
              const count = typeof asset.download_count === "number" ? asset.download_count : 0;
              totalDownloads += count;

              breakdown.push({
                releaseId: rel.id,
                releaseTag: rel.tag_name,
                releaseName: rel.name || rel.tag_name,
                assetId: asset.id,
                assetName: asset.name,
                downloadCount: count,
                downloadUrl: asset.browser_download_url,
                version: this.extractVersion(rel.tag_name, asset.name),
                createdAt: asset.created_at || rel.created_at,
              });
            }
          }
        }
      }
    }

    return {
      appId: options.appId,
      totalDownloads,
      formattedTotal: this.formatDownloadCount(totalDownloads),
      breakdown,
    };
  }

  /**
   * Mengambil dan menghitung statistik unduhan untuk banyak aplikasi sekaligus secara efisien
   */
  static async getAllAppsDownloadStats(
    apps: Array<{
      id: string;
      name?: string;
      githubTagPrefix?: string;
      apkFileName?: string;
      apkUrl?: string;
    }>
  ): Promise<Record<string, AppDownloadStatsResult>> {
    // Pastikan rilis diambil satu kali untuk seluruh aplikasi
    await this.fetchAllReleases();

    const results: Record<string, AppDownloadStatsResult> = {};
    for (const app of apps) {
      results[app.id] = await this.getAppDownloadStats({
        appId: app.id,
        appName: app.name,
        githubTagPrefix: app.githubTagPrefix,
        apkFileName: app.apkFileName,
        apkUrl: app.apkUrl,
      });
    }
    return results;
  }
}

export interface AssetDownloadBreakdown {
  releaseId: number;
  releaseTag: string;
  releaseName: string;
  assetId: number;
  assetName: string;
  downloadCount: number;
  downloadUrl: string;
  version?: string;
  createdAt: string;
}

export interface AppDownloadStatsResult {
  appId: string;
  totalDownloads: number;
  formattedTotal: string;
  breakdown: AssetDownloadBreakdown[];
}

