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
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "AppHub-Store-Service",
    };
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
}
