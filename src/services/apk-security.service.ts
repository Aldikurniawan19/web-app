import crypto from "crypto";
import fs from "fs";
import https from "https";
import path from "path";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import type {
  ApkSecurityReportDetail,
  ApkSecurityStatus,
  ApkSecuritySummary,
  SecurityEngineHighlight,
} from "@/types/security";

const SECURITY_CACHE_TTL_MS = 60_000;

interface ApkSecurityCacheStore {
  reportByKey: Map<string, { data: ApkSecurityReportDetail | null; timestamp: number }>;
}

const globalForSecurityCache = globalThis as unknown as {
  __allprojectsSecurityCache?: ApkSecurityCacheStore;
};

const securityCache: ApkSecurityCacheStore =
  globalForSecurityCache.__allprojectsSecurityCache ??
  (globalForSecurityCache.__allprojectsSecurityCache = {
    reportByKey: new Map(),
  });

function invalidateSecurityCache(appId?: string): void {
  if (!appId) {
    securityCache.reportByKey.clear();
    return;
  }
  const prefix = `${appId}::`;
  for (const key of securityCache.reportByKey.keys()) {
    if (key.startsWith(prefix)) {
      securityCache.reportByKey.delete(key);
    }
  }
}

const VT_API_BASE = "https://www.virustotal.com/api/v3";
const VT_DIRECT_UPLOAD_MAX_BYTES = 32 * 1024 * 1024;
const VT_MAX_FILE_BYTES = 650 * 1024 * 1024;

const PRIORITY_ENGINE_NAMES = [
  "Bitdefender",
  "Kaspersky",
  "ESET-NOD32",
  "Avast",
  "AVG",
  "Microsoft",
  "Sophos",
  "Google",
  "McAfee",
  "TrendMicro",
  "Malwarebytes",
  "Symantec",
  "F-Secure",
  "Avira",
  "AhnLab-V3",
  "DrWeb",
];

const SCAN_DETAIL_SELECT = {
  id: true,
  appId: true,
  version: true,
  apkFileName: true,
  sha256: true,
  provider: true,
  analysisId: true,
  status: true,
  maliciousCount: true,
  suspiciousCount: true,
  undetectedCount: true,
  totalEngines: true,
  permalink: true,
  engineHighlights: true,
  errorMessage: true,
  scannedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const SCAN_SUMMARY_SELECT = {
  id: true,
  appId: true,
  version: true,
  sha256: true,
  provider: true,
  status: true,
  maliciousCount: true,
  suspiciousCount: true,
  undetectedCount: true,
  totalEngines: true,
  permalink: true,
  scannedAt: true,
} as const;

interface VirusTotalAnalysisStats {
  malicious?: number;
  suspicious?: number;
  undetected?: number;
  harmless?: number;
}

interface VirusTotalEngineResult {
  engine_name?: string;
  category?: string;
  result?: string | null;
}

interface ParsedScanOutcome {
  status: ApkSecurityStatus;
  maliciousCount: number;
  suspiciousCount: number;
  undetectedCount: number;
  totalEngines: number;
  engineHighlights: SecurityEngineHighlight[];
  scannedAt: Date;
}

interface HttpsResponseData {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: Buffer;
  finalUrl: string;
}

function isMissingScanTableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("apk_security_scans") &&
    (msg.includes("does not exist") || msg.includes("P2021") || msg.includes("42P01"))
  );
}

function getExtraAllowedApkHosts(): Set<string> {
  const hosts = new Set<string>();
  const extra = process.env.ALLOWED_APK_SCAN_HOSTS || "";
  for (const rawHost of extra.split(",")) {
    const trimmed = rawHost.trim().toLowerCase();
    if (trimmed) hosts.add(trimmed);
  }
  return hosts;
}

function isAllowedApkHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "github.com" ||
    host === "api.github.com" ||
    host.endsWith(".githubusercontent.com")
  ) {
    return true;
  }
  return getExtraAllowedApkHosts().has(host);
}

function isAllowedVirusTotalHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "www.virustotal.com" ||
    host === "virustotal.com" ||
    host.endsWith(".virustotal.com") ||
    host.endsWith(".googleapis.com")
  );
}

function getErrorCodes(err: unknown): string[] {
  if (!err || typeof err !== "object") return [];
  const e = err as {
    code?: string;
    cause?: { code?: string };
    errors?: Array<{ code?: string }>;
  };
  const codes: string[] = [];
  if (e.code) codes.push(e.code);
  if (e.cause?.code) codes.push(e.cause.code);
  if (Array.isArray(e.errors)) {
    for (const sub of e.errors) {
      if (sub?.code) codes.push(sub.code);
    }
  }
  return Array.from(new Set(codes));
}

function extractNetworkErrorDetail(step: string, err: unknown): Error {
  if (!(err instanceof Error)) {
    return new Error(`[${step}] ${String(err)}`);
  }
  const errWithDetails = err as Error & {
    cause?: { message?: string };
    errors?: Array<{ message?: string; code?: string }>;
  };
  const codes = getErrorCodes(err).join(", ");
  const nestedMsg = Array.isArray(errWithDetails.errors)
    ? errWithDetails.errors.map((sub) => sub?.message).filter(Boolean).join("; ")
    : "";
  const causeMsg = errWithDetails.cause?.message || "";
  const detail = [err.message, codes, causeMsg, nestedMsg]
    .filter(Boolean)
    .join(" | ");
  return new Error(`[${step}] ${detail || "Kegagalan koneksi jaringan"}`);
}

function performSingleHttpsRequest(
  urlString: string,
  options: {
    method?: "GET" | "POST";
    headers?: Record<string, string>;
    bodyChunks?: Buffer[];
    timeoutMs?: number;
    maxBytes?: number;
    family?: 4 | 6;
  }
): Promise<HttpsResponseData> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "https:") {
      reject(new Error(`Protokol harus HTTPS (diterima: ${parsed.protocol})`));
      return;
    }

    const timeoutMs = options.timeoutMs ?? 60_000;
    const maxBytes = options.maxBytes ?? VT_MAX_FILE_BYTES;
    const method = options.method ?? "GET";

    const req = https.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method,
        headers: {
          "User-Agent": "AppHub-Store-Service/1.0",
          ...(options.headers || {}),
        },
        ...(options.family ? { family: options.family } : {}),
      },
      (res) => {
        const chunks: Buffer[] = [];
        let receivedBytes = 0;

        res.on("data", (chunk: Buffer) => {
          receivedBytes += chunk.length;
          if (receivedBytes > maxBytes) {
            req.destroy(
              new Error(`Ukuran respons melebihi batas maksimal ${Math.round(maxBytes / (1024 * 1024))} MB.`)
            );
            return;
          }
          chunks.push(chunk);
        });

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers as Record<string, string | string[] | undefined>,
            body: Buffer.concat(chunks),
            finalUrl: urlString,
          });
        });

        res.on("error", (resErr) => {
          reject(resErr);
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(
        new Error(`Koneksi ke ${parsed.hostname} melebihi batas waktu (${Math.round(timeoutMs / 1000)} detik).`)
      );
    });

    req.on("error", (reqErr) => {
      reject(reqErr);
    });

    if (options.bodyChunks && options.bodyChunks.length > 0) {
      for (const chunk of options.bodyChunks) {
        req.write(chunk);
      }
    }
    req.end();
  });
}

/**
 * Wrapper HTTPS native (bebas gangguan Next.js fetch cache/stream dan IPv6 timeout Windows).
 * Mengikuti redirect aman hingga 5 kali dan melakukan retry otomatis IPv4 jika jaringan IPv6 bermasalah.
 */
async function httpsRequestWithRedirects(
  initialUrl: string,
  options: {
    stepName: string;
    method?: "GET" | "POST";
    headers?: Record<string, string>;
    bodyChunks?: Buffer[];
    timeoutMs?: number;
    maxBytes?: number;
    validateHost: (hostname: string) => boolean;
  }
): Promise<HttpsResponseData> {
  let currentUrl = initialUrl;
  let currentHeaders = { ...(options.headers || {}) };
  const initialHost = new URL(initialUrl).hostname.toLowerCase();

  for (let hop = 0; hop <= 5; hop++) {
    const parsed = new URL(currentUrl);
    if (!options.validateHost(parsed.hostname)) {
      throw new Error(
        `[${options.stepName}] Host '${parsed.hostname}' tidak termasuk dalam daftar sumber yang diizinkan.`
      );
    }

    let response: HttpsResponseData;
    try {
      response = await performSingleHttpsRequest(currentUrl, {
        method: hop === 0 ? options.method : "GET",
        headers: currentHeaders,
        bodyChunks: hop === 0 ? options.bodyChunks : undefined,
        timeoutMs: options.timeoutMs,
        maxBytes: options.maxBytes,
      });
    } catch (firstErr: unknown) {
      const codes = getErrorCodes(firstErr);
      const isRetryableNetworkErr =
        codes.some(
          (c) =>
            c === "ETIMEDOUT" ||
            c === "ENETUNREACH" ||
            c === "EHOSTUNREACH" ||
            c === "ECONNRESET"
        ) ||
        (firstErr instanceof Error && firstErr.message.includes("ETIMEDOUT"));

      if (isRetryableNetworkErr) {
        try {
          response = await performSingleHttpsRequest(currentUrl, {
            method: hop === 0 ? options.method : "GET",
            headers: currentHeaders,
            bodyChunks: hop === 0 ? options.bodyChunks : undefined,
            timeoutMs: options.timeoutMs,
            maxBytes: options.maxBytes,
            family: 4,
          });
        } catch (retryErr: unknown) {
          throw extractNetworkErrorDetail(options.stepName, retryErr);
        }
      } else {
        throw extractNetworkErrorDetail(options.stepName, firstErr);
      }
    }

    const status = response.statusCode;
    const locationHeader = response.headers.location;
    const rawLocation = Array.isArray(locationHeader)
      ? locationHeader[0]
      : locationHeader;

    if (
      (status === 301 ||
        status === 302 ||
        status === 303 ||
        status === 307 ||
        status === 308) &&
      rawLocation
    ) {
      const nextUrlObj = new URL(rawLocation, currentUrl);
      if (nextUrlObj.hostname.toLowerCase() !== initialHost) {
        // Jangan bawa header kredensial sensitif ketika redirect lintas domain
        delete currentHeaders.Authorization;
        delete currentHeaders.authorization;
        delete currentHeaders["x-apikey"];
      }
      currentUrl = nextUrlObj.toString();
      continue;
    }

    return response;
  }

  throw new Error(`[${options.stepName}] Terlalu banyak pengalihan URL (redirect).`);
}

function normalizeStatus(status: string): ApkSecurityStatus {
  if (
    status === "pending" ||
    status === "clean" ||
    status === "suspicious" ||
    status === "malicious" ||
    status === "failed"
  ) {
    return status;
  }
  return "pending";
}

function parseHighlightsJson(raw: unknown): SecurityEngineHighlight[] {
  if (!Array.isArray(raw)) return [];
  const items: SecurityEngineHighlight[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const obj = entry as Record<string, unknown>;
    const engineName = typeof obj.engineName === "string" ? obj.engineName : "";
    const cat = obj.category;
    const result = typeof obj.result === "string" ? obj.result : null;
    if (
      engineName &&
      (cat === "undetected" ||
        cat === "harmless" ||
        cat === "suspicious" ||
        cat === "malicious")
    ) {
      items.push({ engineName, category: cat, result });
    }
  }
  return items;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToSummary(record: any): ApkSecuritySummary {
  return {
    id: record.id,
    appId: record.appId,
    version: record.version,
    sha256: record.sha256,
    provider: record.provider || "virustotal",
    status: normalizeStatus(record.status),
    maliciousCount: Number(record.maliciousCount ?? 0),
    suspiciousCount: Number(record.suspiciousCount ?? 0),
    undetectedCount: Number(record.undetectedCount ?? 0),
    totalEngines: Number(record.totalEngines ?? 0),
    permalink: record.permalink || undefined,
    scannedAt: record.scannedAt ? new Date(record.scannedAt).toISOString() : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToDetail(record: any): ApkSecurityReportDetail {
  return {
    ...mapToSummary(record),
    apkFileName: record.apkFileName || undefined,
    analysisId: record.analysisId || undefined,
    engineHighlights: parseHighlightsJson(record.engineHighlights),
    errorMessage: record.errorMessage || undefined,
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

/**
 * Mengekstrak daftar vendor antivirus utama serta hasil deteksinya secara terurut.
 */
function parseVirusTotalResults(
  stats: VirusTotalAnalysisStats = {},
  resultsMap: Record<string, VirusTotalEngineResult> = {},
  unixTimestamp?: number
): ParsedScanOutcome {
  const maliciousCount = Number(stats.malicious ?? 0);
  const suspiciousCount = Number(stats.suspicious ?? 0);
  const undetectedCount = Number(stats.undetected ?? 0) + Number(stats.harmless ?? 0);
  const totalEngines = maliciousCount + suspiciousCount + undetectedCount;

  const flagged: SecurityEngineHighlight[] = [];
  const cleanPriority: SecurityEngineHighlight[] = [];
  const cleanOther: SecurityEngineHighlight[] = [];

  for (const [keyName, item] of Object.entries(resultsMap)) {
    const category = item.category;
    if (
      category !== "undetected" &&
      category !== "harmless" &&
      category !== "suspicious" &&
      category !== "malicious"
    ) {
      continue;
    }

    const engineName = (item.engine_name || keyName).trim();
    const highlight: SecurityEngineHighlight = {
      engineName,
      category,
      result: item.result || null,
    };

    if (category === "malicious" || category === "suspicious") {
      flagged.push(highlight);
    } else if (
      PRIORITY_ENGINE_NAMES.some(
        (p) => p.toLowerCase() === engineName.toLowerCase()
      )
    ) {
      cleanPriority.push(highlight);
    } else {
      cleanOther.push(highlight);
    }
  }

  cleanPriority.sort(
    (a, b) =>
      PRIORITY_ENGINE_NAMES.findIndex(
        (p) => p.toLowerCase() === a.engineName.toLowerCase()
      ) -
      PRIORITY_ENGINE_NAMES.findIndex(
        (p) => p.toLowerCase() === b.engineName.toLowerCase()
      )
  );

  const engineHighlights = [
    ...flagged,
    ...cleanPriority,
    ...cleanOther,
  ].slice(0, 16);

  let status: ApkSecurityStatus = "clean";
  if (maliciousCount > 0) {
    status = "malicious";
  } else if (suspiciousCount > 0) {
    status = "suspicious";
  } else if (totalEngines === 0) {
    status = "pending";
  }

  const scannedAt = unixTimestamp ? new Date(unixTimestamp * 1000) : new Date();

  return {
    status,
    maliciousCount,
    suspiciousCount,
    undetectedCount,
    totalEngines,
    engineHighlights,
    scannedAt,
  };
}

/**
 * Service Layer untuk pemindaian keamanan berkas APK menggunakan VirusTotal API v3
 * serta penyimpanan laporan scan terstruktur di PostgreSQL (apk_security_scans).
 */
export class ApkSecurityService {
  private static getApiKey(): string {
    return process.env.VIRUSTOTAL_API_KEY?.trim() || "";
  }

  private static assertApiKey(): string {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error(
        "VIRUSTOTAL_API_KEY belum dikonfigurasi pada environment server (.env)."
      );
    }
    return apiKey;
  }

  /**
   * Menghitung hash kriptografis SHA-256 dari buffer biner APK.
   */
  static computeSha256(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex").toLowerCase();
  }

  /**
   * Fallback mengunduh aset rilis privat GitHub melalui GitHub REST API jika URL publik mengembalikan 404.
   */
  private static async tryDownloadPrivateGithubAsset(
    apkUrl: string
  ): Promise<Buffer | null> {
    const githubToken = process.env.GITHUB_TOKEN?.trim();
    if (!githubToken) return null;

    const match = apkUrl.match(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/download\/([^/]+)\/([^/?#]+)/i
    );
    if (!match) return null;

    const [, owner, repo, tag, rawAssetName] = match;
    const targetAssetName = decodeURIComponent(rawAssetName);

    const releaseRes = await httpsRequestWithRedirects(
      `https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
      {
        stepName: "Ambil Metadata Rilis GitHub",
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          Authorization: `Bearer ${githubToken}`,
        },
        timeoutMs: 30_000,
        validateHost: isAllowedApkHost,
      }
    );

    if (releaseRes.statusCode !== 200) return null;
    const releaseJson = JSON.parse(releaseRes.body.toString("utf8"));
    const assets = Array.isArray(releaseJson?.assets) ? releaseJson.assets : [];
    const matchedAsset = assets.find(
      (a: { id?: number; name?: string }) =>
        a.name?.toLowerCase() === targetAssetName.toLowerCase()
    );
    if (!matchedAsset?.id) return null;

    const binaryRes = await httpsRequestWithRedirects(
      `https://api.github.com/repos/${owner}/${repo}/releases/assets/${matchedAsset.id}`,
      {
        stepName: "Unduh Aset Rilis Privat GitHub",
        method: "GET",
        headers: {
          Accept: "application/octet-stream",
          "X-GitHub-Api-Version": "2022-11-28",
          Authorization: `Bearer ${githubToken}`,
        },
        timeoutMs: 120_000,
        validateHost: isAllowedApkHost,
      }
    );

    if (binaryRes.statusCode < 200 || binaryRes.statusCode >= 300) {
      return null;
    }

    return binaryRes.body;
  }

  /**
   * Mengunduh berkas APK secara aman (dengan validasi allowlist host) dan menghitung SHA-256.
   */
  private static async loadApkBinaryFromSource(
    apkUrl: string
  ): Promise<{ buffer: Buffer; sha256: string; fileName: string }> {
    const trimmed = apkUrl.trim();
    if (!trimmed) {
      throw new Error("Tautan berkas APK belum tersedia untuk dipindai.");
    }

    // 1. Jika berkas tersimpan secara lokal di public/downloads/
    if (trimmed.startsWith("/downloads/")) {
      const downloadsDir = path.resolve(process.cwd(), "public", "downloads");
      const rawName = decodeURIComponent(trimmed.replace(/^\/downloads\//, ""));
      const targetPath = path.resolve(downloadsDir, rawName);

      if (!targetPath.startsWith(downloadsDir + path.sep)) {
        throw new Error("Jalur berkas APK lokal tidak valid.");
      }
      if (!fs.existsSync(targetPath)) {
        throw new Error("Berkas APK lokal tidak ditemukan di server.");
      }

      const buffer = await fs.promises.readFile(targetPath);
      if (buffer.length > VT_MAX_FILE_BYTES) {
        throw new Error("Ukuran berkas APK melebihi batas maksimal 650 MB VirusTotal.");
      }

      return {
        buffer,
        sha256: this.computeSha256(buffer),
        fileName: path.basename(targetPath),
      };
    }

    // 2. Jika berasal dari URL HTTPS eksternal yang diizinkan (misal GitHub Releases)
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      throw new Error("Format URL berkas APK tidak valid.");
    }

    if (parsedUrl.protocol !== "https:") {
      throw new Error("Hanya URL berkas APK berbasis HTTPS yang diizinkan untuk pemindaian.");
    }

    const res = await httpsRequestWithRedirects(parsedUrl.toString(), {
      stepName: "Unduh Berkas APK",
      method: "GET",
      timeoutMs: 120_000,
      maxBytes: VT_MAX_FILE_BYTES,
      validateHost: isAllowedApkHost,
    });

    let buffer = res.body;

    if (res.statusCode === 404 || res.statusCode === 403) {
      const privateBuffer = await this.tryDownloadPrivateGithubAsset(parsedUrl.toString());
      if (privateBuffer) {
        buffer = privateBuffer;
      } else {
        throw new Error(
          `[Unduh Berkas APK] Berkas tidak ditemukan atau akses ditolak di URL rilis (HTTP ${res.statusCode}).`
        );
      }
    } else if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error(
        `[Unduh Berkas APK] Gagal mengunduh berkas dari sumber rilis (HTTP ${res.statusCode}).`
      );
    }

    if (buffer.length === 0) {
      throw new Error("Berkas APK kosong (0 bytes) sehingga tidak dapat dipindai.");
    }
    if (buffer.length > VT_MAX_FILE_BYTES) {
      throw new Error("Ukuran berkas APK melebihi batas maksimal 650 MB VirusTotal.");
    }

    const derivedName =
      decodeURIComponent(parsedUrl.pathname.split("/").pop() || "") || "app-release.apk";

    return {
      buffer,
      sha256: this.computeSha256(buffer),
      fileName: derivedName,
    };
  }

  /**
   * Mengecek apakah laporan pemindaian untuk SHA-256 sudah tersedia di VirusTotal.
   */
  private static async fetchVirusTotalFileReport(
    sha256: string,
    apiKey: string
  ): Promise<ParsedScanOutcome | null> {
    const res = await httpsRequestWithRedirects(
      `${VT_API_BASE}/files/${encodeURIComponent(sha256)}`,
      {
        stepName: "Cek Laporan Hash VirusTotal",
        method: "GET",
        headers: {
          "x-apikey": apiKey,
          Accept: "application/json",
        },
        timeoutMs: 30_000,
        validateHost: isAllowedVirusTotalHost,
      }
    );

    if (res.statusCode === 404) {
      return null;
    }
    if (res.statusCode === 429) {
      throw new Error(
        "Batas kuota permintaan VirusTotal API (4 request/menit) tercapai. Tunggu beberapa saat lalu coba lagi."
      );
    }
    if (res.statusCode === 401 || res.statusCode === 403) {
      throw new Error(
        "VIRUSTOTAL_API_KEY tidak valid atau ditolak oleh server VirusTotal."
      );
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error(`VirusTotal mengembalikan status HTTP ${res.statusCode}.`);
    }

    const json = JSON.parse(res.body.toString("utf8"));
    const attrs = json?.data?.attributes;
    if (!attrs) return null;

    return parseVirusTotalResults(
      attrs.last_analysis_stats,
      attrs.last_analysis_results,
      attrs.last_analysis_date
    );
  }

  /**
   * Mengunggah berkas APK ke VirusTotal dengan multipart Content-Length eksplisit.
   */
  private static async submitFileToVirusTotal(
    buffer: Buffer,
    fileName: string,
    apiKey: string
  ): Promise<string> {
    let targetUploadUrl = `${VT_API_BASE}/files`;

    if (buffer.length > VT_DIRECT_UPLOAD_MAX_BYTES) {
      const urlRes = await httpsRequestWithRedirects(`${VT_API_BASE}/files/upload_url`, {
        stepName: "Minta URL Unggahan VirusTotal",
        method: "GET",
        headers: {
          "x-apikey": apiKey,
          Accept: "application/json",
        },
        timeoutMs: 30_000,
        validateHost: isAllowedVirusTotalHost,
      });

      if (urlRes.statusCode === 429) {
        throw new Error(
          "Batas kuota permintaan VirusTotal API tercapai saat meminta URL unggahan besar."
        );
      }
      if (urlRes.statusCode < 200 || urlRes.statusCode >= 300) {
        throw new Error(
          `Gagal meminta URL unggahan berkas besar VirusTotal (HTTP ${urlRes.statusCode}).`
        );
      }

      const urlJson = JSON.parse(urlRes.body.toString("utf8"));
      if (!urlJson?.data || typeof urlJson.data !== "string") {
        throw new Error("Respons URL unggahan VirusTotal tidak valid.");
      }
      targetUploadUrl = urlJson.data;
    }

    const boundary = `----AppHubVTBoundary${crypto.randomBytes(12).toString("hex")}`;
    const safeFileName = fileName.replace(/["\r\n]/g, "_");
    const head = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${safeFileName}"\r\nContent-Type: application/vnd.android.package-archive\r\n\r\n`,
      "utf8"
    );
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`, "utf8");
    const totalLength = head.length + buffer.length + tail.length;

    const uploadRes = await httpsRequestWithRedirects(targetUploadUrl, {
      stepName: "Unggah APK ke VirusTotal",
      method: "POST",
      headers: {
        "x-apikey": apiKey,
        Accept: "application/json",
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": String(totalLength),
      },
      bodyChunks: [head, buffer, tail],
      timeoutMs: 120_000,
      validateHost: isAllowedVirusTotalHost,
    });

    if (uploadRes.statusCode === 429) {
      throw new Error(
        "Batas kuota permintaan VirusTotal API tercapai saat mengunggah berkas."
      );
    }
    if (uploadRes.statusCode < 200 || uploadRes.statusCode >= 300) {
      throw new Error(
        `Gagal mengunggah berkas APK ke VirusTotal (HTTP ${uploadRes.statusCode}).`
      );
    }

    const uploadJson = JSON.parse(uploadRes.body.toString("utf8"));
    const analysisId = uploadJson?.data?.id;
    if (!analysisId || typeof analysisId !== "string") {
      throw new Error("VirusTotal tidak mengembalikan ID analisis yang valid.");
    }

    return analysisId;
  }

  /**
   * Mengecek status analisis yang sedang mengantre di VirusTotal.
   */
  private static async fetchVirusTotalAnalysis(
    analysisId: string,
    apiKey: string
  ): Promise<{ completed: boolean; outcome?: ParsedScanOutcome }> {
    const res = await httpsRequestWithRedirects(
      `${VT_API_BASE}/analyses/${encodeURIComponent(analysisId)}`,
      {
        stepName: "Cek Status Antrean VirusTotal",
        method: "GET",
        headers: {
          "x-apikey": apiKey,
          Accept: "application/json",
        },
        timeoutMs: 30_000,
        validateHost: isAllowedVirusTotalHost,
      }
    );

    if (res.statusCode === 429) {
      throw new Error(
        "Batas permintaan VirusTotal API (4 request/menit) tercapai. Coba beberapa detik lagi."
      );
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error(
        `Gagal memeriksa status analisis VirusTotal (HTTP ${res.statusCode}).`
      );
    }

    const json = JSON.parse(res.body.toString("utf8"));
    const attrs = json?.data?.attributes;
    if (!attrs || attrs.status !== "completed") {
      return { completed: false };
    }

    return {
      completed: true,
      outcome: parseVirusTotalResults(
        attrs.stats,
        attrs.results,
        attrs.date
      ),
    };
  }

  /**
   * Memicu pemindaian VirusTotal secara manual dari panel admin untuk aplikasi & versi tertentu.
   * Langkah: hitung SHA-256 -> cek laporan yang sudah ada -> unggah APK jika belum tercatat.
   */
  static async triggerAdminScan(params: {
    appId: string;
    version?: string;
    apkUrl?: string;
    apkFileName?: string;
    knownSha256?: string;
  }): Promise<ApkSecurityReportDetail> {
    const apiKey = this.assertApiKey();

    const appRecord = await prisma.app.findUnique({
      where: { id: params.appId },
      select: {
        id: true,
        name: true,
        version: true,
        apkUrl: true,
        apkFileName: true,
      },
    });

    if (!appRecord) {
      throw new Error(`Aplikasi dengan ID '${params.appId}' tidak ditemukan.`);
    }

    const targetVersion = (params.version || appRecord.version || "1.0.0")
      .trim()
      .replace(/^v/i, "");
    const targetUrl = (params.apkUrl || appRecord.apkUrl || "").trim();
    const fallbackFileName =
      params.apkFileName ||
      appRecord.apkFileName ||
      `${appRecord.id}-v${targetVersion}.apk`;

    let sha256 = (params.knownSha256 || "").trim().toLowerCase();
    let binaryBuffer: Buffer | null = null;
    let resolvedFileName = fallbackFileName;

    if (!sha256) {
      const loaded = await this.loadApkBinaryFromSource(targetUrl);
      sha256 = loaded.sha256;
      binaryBuffer = loaded.buffer;
      resolvedFileName = loaded.fileName || fallbackFileName;
    }

    const permalink = `https://www.virustotal.com/gui/file/${sha256}`;

    // 1. Cek apakah hash SHA-256 sudah pernah dipindai di VirusTotal
    let outcome = await this.fetchVirusTotalFileReport(sha256, apiKey);

    if (outcome) {
      return await this.upsertScanRecord({
        appId: appRecord.id,
        version: targetVersion,
        apkFileName: resolvedFileName,
        sha256,
        provider: "virustotal",
        analysisId: null,
        status: outcome.status,
        maliciousCount: outcome.maliciousCount,
        suspiciousCount: outcome.suspiciousCount,
        undetectedCount: outcome.undetectedCount,
        totalEngines: outcome.totalEngines,
        permalink,
        engineHighlights: outcome.engineHighlights,
        errorMessage: null,
        scannedAt: outcome.scannedAt,
      });
    }

    // 2. Jika belum ada di VirusTotal (404), pastikan biner APK tersedia lalu unggah
    if (!binaryBuffer) {
      const loaded = await this.loadApkBinaryFromSource(targetUrl);
      binaryBuffer = loaded.buffer;
      resolvedFileName = loaded.fileName || resolvedFileName;
    }

    const analysisId = await this.submitFileToVirusTotal(
      binaryBuffer,
      resolvedFileName,
      apiKey
    );

    // Periksa sekali secara cepat apakah hasil langsung selesai atau masih mengantre
    const quickCheck = await this.fetchVirusTotalAnalysis(analysisId, apiKey).catch(
      () => ({ completed: false as const, outcome: undefined })
    );

    if (quickCheck.completed && quickCheck.outcome) {
      outcome = quickCheck.outcome;
      return await this.upsertScanRecord({
        appId: appRecord.id,
        version: targetVersion,
        apkFileName: resolvedFileName,
        sha256,
        provider: "virustotal",
        analysisId,
        status: outcome.status,
        maliciousCount: outcome.maliciousCount,
        suspiciousCount: outcome.suspiciousCount,
        undetectedCount: outcome.undetectedCount,
        totalEngines: outcome.totalEngines,
        permalink,
        engineHighlights: outcome.engineHighlights,
        errorMessage: null,
        scannedAt: outcome.scannedAt,
      });
    }

    return await this.upsertScanRecord({
      appId: appRecord.id,
      version: targetVersion,
      apkFileName: resolvedFileName,
      sha256,
      provider: "virustotal",
      analysisId,
      status: "pending",
      maliciousCount: 0,
      suspiciousCount: 0,
      undetectedCount: 0,
      totalEngines: 0,
      permalink,
      engineHighlights: [],
      errorMessage: null,
      scannedAt: null,
    });
  }

  /**
   * Menyimpan atau memperbarui baris hasil scan pada tabel apk_security_scans.
   */
  private static async upsertScanRecord(data: {
    appId: string;
    version: string;
    apkFileName: string;
    sha256: string;
    provider: string;
    analysisId: string | null;
    status: ApkSecurityStatus;
    maliciousCount: number;
    suspiciousCount: number;
    undetectedCount: number;
    totalEngines: number;
    permalink: string;
    engineHighlights: SecurityEngineHighlight[];
    errorMessage: string | null;
    scannedAt: Date | null;
  }): Promise<ApkSecurityReportDetail> {
    const existing = await prisma.apkSecurityScan.findFirst({
      where: {
        appId: data.appId,
        version: data.version,
        sha256: data.sha256,
      },
      select: { id: true },
    });

    const jsonHighlights = data.engineHighlights as unknown as Prisma.InputJsonValue;

    if (existing) {
      const updated = await prisma.apkSecurityScan.update({
        where: { id: existing.id },
        data: {
          apkFileName: data.apkFileName,
          provider: data.provider,
          analysisId: data.analysisId,
          status: data.status,
          maliciousCount: data.maliciousCount,
          suspiciousCount: data.suspiciousCount,
          undetectedCount: data.undetectedCount,
          totalEngines: data.totalEngines,
          permalink: data.permalink,
          engineHighlights: jsonHighlights,
          errorMessage: data.errorMessage,
          scannedAt: data.scannedAt,
        },
        select: SCAN_DETAIL_SELECT,
      });
      invalidateSecurityCache(data.appId);
      return mapToDetail(updated);
    }

    const created = await prisma.apkSecurityScan.create({
      data: {
        appId: data.appId,
        version: data.version,
        apkFileName: data.apkFileName,
        sha256: data.sha256,
        provider: data.provider,
        analysisId: data.analysisId,
        status: data.status,
        maliciousCount: data.maliciousCount,
        suspiciousCount: data.suspiciousCount,
        undetectedCount: data.undetectedCount,
        totalEngines: data.totalEngines,
        permalink: data.permalink,
        engineHighlights: jsonHighlights,
        errorMessage: data.errorMessage,
        scannedAt: data.scannedAt,
      },
      select: SCAN_DETAIL_SELECT,
    });

    invalidateSecurityCache(data.appId);
    return mapToDetail(created);
  }

  /**
   * Mengambil laporan scan terbaru untuk sebuah aplikasi (atau versi spesifik),
   * dan opsional menyinkronkan status "pending" dari VirusTotal saat diminta dari admin.
   */
  static async getSecurityReport(
    appId: string,
    version?: string,
    options?: { syncPending?: boolean }
  ): Promise<ApkSecurityReportDetail | null> {
    try {
      const cleanVersion = version ? version.trim().replace(/^v/i, "") : undefined;
      const cacheKey = `${appId}::${cleanVersion || "*"}`;

      if (!options?.syncPending) {
        const cached = securityCache.reportByKey.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < SECURITY_CACHE_TTL_MS) {
          return cached.data;
        }
      }

      let record = await withDbRetry(
        () =>
          prisma.apkSecurityScan.findFirst({
            where: {
              appId,
              ...(cleanVersion ? { version: cleanVersion } : {}),
            },
            orderBy: { updatedAt: "desc" },
            select: SCAN_DETAIL_SELECT,
          }),
        3,
        "SecurityReport Retry"
      );

      // Fallback ke laporan scan terbaru milik aplikasi jika versi spesifik belum punya record
      if (!record && cleanVersion) {
        record = await withDbRetry(
          () =>
            prisma.apkSecurityScan.findFirst({
              where: { appId },
              orderBy: { updatedAt: "desc" },
              select: SCAN_DETAIL_SELECT,
            }),
          3,
          "SecurityReport Fallback Retry"
        );
      }

      if (!record) {
        securityCache.reportByKey.set(cacheKey, {
          data: null,
          timestamp: Date.now(),
        });
        return null;
      }

      if (
        options?.syncPending &&
        record.status === "pending" &&
        this.getApiKey()
      ) {
        const apiKey = this.getApiKey();
        let outcome = await this.fetchVirusTotalFileReport(
          record.sha256,
          apiKey
        ).catch(() => null);

        if (!outcome && record.analysisId) {
          const analysis = await this.fetchVirusTotalAnalysis(
            record.analysisId,
            apiKey
          );
          if (analysis.completed && analysis.outcome) {
            outcome = analysis.outcome;
          }
        }

        if (outcome) {
          const updated = await prisma.apkSecurityScan.update({
            where: { id: record.id },
            data: {
              status: outcome.status,
              maliciousCount: outcome.maliciousCount,
              suspiciousCount: outcome.suspiciousCount,
              undetectedCount: outcome.undetectedCount,
              totalEngines: outcome.totalEngines,
              engineHighlights:
                outcome.engineHighlights as unknown as Prisma.InputJsonValue,
              scannedAt: outcome.scannedAt,
              errorMessage: null,
            },
            select: SCAN_DETAIL_SELECT,
          });
          const mappedUpdated = mapToDetail(updated);
          invalidateSecurityCache(appId);
          securityCache.reportByKey.set(cacheKey, {
            data: mappedUpdated,
            timestamp: Date.now(),
          });
          return mappedUpdated;
        }
      }

      const mapped = mapToDetail(record);
      securityCache.reportByKey.set(cacheKey, {
        data: mapped,
        timestamp: Date.now(),
      });
      return mapped;
    } catch (err) {
      if (isMissingScanTableError(err)) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Mengambil ringkasan scan terbaru dalam 1 query batch untuk daftar aplikasi (mencegah N+1).
   */
  static async getLatestScansMapForApps(
    apps: Array<{ id: string; version: string }>
  ): Promise<Record<string, ApkSecuritySummary>> {
    if (apps.length === 0) return {};

    try {
      const records = await withDbRetry(
        () =>
          prisma.apkSecurityScan.findMany({
            where: {
              appId: { in: apps.map((a) => a.id) },
            },
            orderBy: { updatedAt: "desc" },
            select: SCAN_SUMMARY_SELECT,
          }),
        3,
        "SecurityScansMap Retry"
      );

      const appVersionMap = new Map(
        apps.map((a) => [a.id, a.version.trim().replace(/^v/i, "")])
      );
      const result: Record<string, ApkSecuritySummary> = {};

      for (const rec of records) {
        const activeVersion = appVersionMap.get(rec.appId);
        const recVersion = rec.version.trim().replace(/^v/i, "");
        if (activeVersion && recVersion === activeVersion && !result[rec.appId]) {
          result[rec.appId] = mapToSummary(rec);
        }
      }

      return result;
    } catch (err) {
      if (isMissingScanTableError(err)) {
        return {};
      }
      console.warn("Gagal membaca ringkasan scan keamanan APK:", err);
      return {};
    }
  }

  /**
   * Mengambil ringkasan scan per versi untuk riwayat versi suatu aplikasi.
   */
  static async getVersionScansMap(
    appId: string
  ): Promise<Record<string, ApkSecuritySummary>> {
    try {
      const records = await withDbRetry(
        () =>
          prisma.apkSecurityScan.findMany({
            where: { appId },
            orderBy: { updatedAt: "desc" },
            select: SCAN_SUMMARY_SELECT,
          }),
        3,
        "SecurityVersionsMap Retry"
      );

      const result: Record<string, ApkSecuritySummary> = {};
      for (const rec of records) {
        const cleanVer = rec.version.trim().replace(/^v/i, "");
        if (!result[cleanVer]) {
          result[cleanVer] = mapToSummary(rec);
        }
      }
      return result;
    } catch (err) {
      if (isMissingScanTableError(err)) {
        return {};
      }
      return {};
    }
  }
}
