import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { GithubReleaseService } from "@/services/github-release.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ExtractedFile {
  buffer: Buffer;
  fileName: string;
  fileType: string;
  mimeType: string;
  size: number;
}

/**
 * Mem-parse payload multipart/form-data dari raw Buffer dengan deteksi otomatis boundary.
 */
function parseMultipartBuffer(
  rawBuffer: Buffer,
  contentTypeHeader: string = ""
): ExtractedFile | null {
  if (!rawBuffer || rawBuffer.length === 0) return null;

  // 1. Ekstrak boundary dari header Content-Type
  let boundary = "";
  if (contentTypeHeader) {
    const boundaryMatch = contentTypeHeader.match(/boundary=(?:"([^"]+)"|([^;,\r\n]+))/i);
    if (boundaryMatch) {
      boundary = (boundaryMatch[1] || boundaryMatch[2] || "").trim();
    }
  }

  // 2. Fallback deteksi boundary dari baris pertama rawBuffer jika tidak ada di header
  if (!boundary) {
    const headText = rawBuffer.subarray(0, Math.min(rawBuffer.length, 512)).toString("latin1");
    const firstLineMatch = headText.match(/^--([^\r\n]+)/);
    if (firstLineMatch) {
      boundary = firstLineMatch[1].trim();
    }
  }

  // Jika boundary ditemukan, ekstrak bagian-bagian multipart
  if (boundary) {
    const delimiter = Buffer.from(`--${boundary}`);
    let currentPos = 0;
    let fileBuffer: Buffer | null = null;
    let fileName = "file.apk";
    let mimeType = "application/vnd.android.package-archive";
    let fileType = "apk";

    while (currentPos < rawBuffer.length) {
      const boundaryIdx = rawBuffer.indexOf(delimiter, currentPos);
      if (boundaryIdx === -1) break;

      const nextBoundaryIdx = rawBuffer.indexOf(delimiter, boundaryIdx + delimiter.length);
      if (nextBoundaryIdx === -1) break;

      const part = rawBuffer.subarray(boundaryIdx + delimiter.length, nextBoundaryIdx);
      
      let headerSepIdx = part.indexOf("\r\n\r\n");
      let sepLen = 4;
      if (headerSepIdx === -1) {
        headerSepIdx = part.indexOf("\n\n");
        sepLen = 2;
      }

      if (headerSepIdx !== -1) {
        const headerText = part.subarray(0, headerSepIdx).toString("utf-8");
        let bodyData = part.subarray(headerSepIdx + sepLen);

        // Hilangkan CRLF/LF penutup sebelum boundary berikutnya
        if (bodyData.length >= 2 && bodyData[bodyData.length - 2] === 13 && bodyData[bodyData.length - 1] === 10) {
          bodyData = bodyData.subarray(0, bodyData.length - 2);
        } else if (bodyData.length >= 1 && bodyData[bodyData.length - 1] === 10) {
          bodyData = bodyData.subarray(0, bodyData.length - 1);
        }

        const nameMatch = headerText.match(/name=(?:"([^"]+)"|'([^']+)'|([^;\r\n]+))/i);
        const filenameMatch = headerText.match(
          /filename\*?=(?:UTF-8''(?:"([^"]+)"|([^\r\n;]+))|(?:"([^"]+)"|'([^']+)'|([^;\r\n]+)))/i
        );
        const mimeMatch = headerText.match(/Content-Type:\s*([^\r\n;]+)/i);

        const fieldName = (nameMatch ? nameMatch[1] || nameMatch[2] || nameMatch[3] : "").trim();
        const rawFileName = filenameMatch
          ? filenameMatch[1] || filenameMatch[2] || filenameMatch[3] || filenameMatch[4] || filenameMatch[5]
          : "";

        if (rawFileName) {
          fileName = decodeURIComponent(rawFileName.trim().replace(/^["']|["']$/g, ""));
          fileBuffer = Buffer.from(bodyData);
          if (mimeMatch) mimeType = mimeMatch[1].trim();
        } else if (fieldName === "type") {
          fileType = bodyData.toString("utf-8").trim();
        }
      }

      currentPos = nextBoundaryIdx;
    }

    if (fileBuffer) {
      return {
        buffer: fileBuffer,
        fileName,
        fileType,
        mimeType,
        size: fileBuffer.length,
      };
    }
  }

  // 3. Fallback Smart Binary Detection: Jika bukan multipart, cek apakah payload berupa biner langsung
  // Header ZIP/APK signature: 'PK\x03\x04' (0x50, 0x4B, 0x03, 0x04)
  if (
    rawBuffer.length >= 4 &&
    rawBuffer[0] === 0x50 &&
    rawBuffer[1] === 0x4b &&
    rawBuffer[2] === 0x03 &&
    rawBuffer[3] === 0x04
  ) {
    return {
      buffer: rawBuffer,
      fileName: "app-release.apk",
      fileType: "apk",
      mimeType: "application/vnd.android.package-archive",
      size: rawBuffer.length,
    };
  }

  // Header PNG: 0x89, 0x50, 0x4E, 0x47
  if (
    rawBuffer.length >= 4 &&
    rawBuffer[0] === 0x89 &&
    rawBuffer[1] === 0x50 &&
    rawBuffer[2] === 0x4e &&
    rawBuffer[3] === 0x47
  ) {
    return {
      buffer: rawBuffer,
      fileName: "image.png",
      fileType: "image",
      mimeType: "image/png",
      size: rawBuffer.length,
    };
  }

  // Header JPEG: 0xFF, 0xD8, 0xFF
  if (rawBuffer.length >= 3 && rawBuffer[0] === 0xff && rawBuffer[1] === 0xd8 && rawBuffer[2] === 0xff) {
    return {
      buffer: rawBuffer,
      fileName: "image.jpg",
      fileType: "image",
      mimeType: "image/jpeg",
      size: rawBuffer.length,
    };
  }

  return null;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan. Sesi tidak valid." },
      { status: 401 }
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    
    // Baca seluruh stream chunk-by-chunk untuk memastikan tidak ada pemotongan biner (misal file 80MB+)
    let rawBuffer: Buffer;
    if (request.body) {
      const chunks: Uint8Array[] = [];
      const reader = request.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      rawBuffer = Buffer.concat(chunks);
    } else {
      const rawArrayBuffer = await request.arrayBuffer();
      rawBuffer = Buffer.from(rawArrayBuffer);
    }

    const sizeInMb = (rawBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`[Upload API] Berkas biner diterima: ${rawBuffer.length} bytes (${sizeInMb} MB)`);

    if (rawBuffer.length === 0) {
      return NextResponse.json(
        { success: false, message: "Payload request kosong." },
        { status: 400 }
      );
    }

    let extracted: ExtractedFile | null = null;

    // A. Cek apakah dikirim via direct stream header x-file-name (Metode tercepat & paling handal)
    const headerFileName = request.headers.get("x-file-name");
    if (headerFileName) {
      const decodedName = decodeURIComponent(headerFileName);
      const fileType =
        request.headers.get("x-file-type") ||
        (decodedName.toLowerCase().endsWith(".apk") ? "apk" : "image");
      const mimeType =
        fileType === "apk" ? "application/vnd.android.package-archive" : "image/png";

      extracted = {
        buffer: rawBuffer,
        fileName: decodedName,
        fileType,
        mimeType,
        size: rawBuffer.length,
      };
    } else {
      // B. Fallback parse payload multipart/form-data
      extracted = parseMultipartBuffer(rawBuffer, contentType);
    }

    if (!extracted) {
      return NextResponse.json(
        { success: false, message: "Gagal mengekstrak berkas dari payload request." },
        { status: 400 }
      );
    }

    const { buffer, fileName, fileType, mimeType } = extracted;

    // 1. Jika tipe berkas adalah Gambar (Ikon atau Screenshot)
    if (fileType === "image" || mimeType.startsWith("image/")) {
      const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

      return NextResponse.json({
        success: true,
        message: "Gambar berhasil diproses.",
        data: {
          fileName,
          fileSize: `${(buffer.length / 1024).toFixed(1)} KB`,
          downloadUrl: base64Data,
        },
      });
    }

    // 2. Jika tipe berkas adalah APK
    if (!fileName.toLowerCase().endsWith(".apk")) {
      return NextResponse.json(
        {
          success: false,
          message: "Format berkas tidak valid. Hanya berkas berekstensi .apk yang diizinkan untuk aplikasi.",
        },
        { status: 400 }
      );
    }

    try {
      // Unggah biner APK ke GitHub Release (dengan fallback otomatis ke penyimpanan lokal)
      const uploadResult = await GithubReleaseService.uploadApkAsset(buffer, fileName);

      return NextResponse.json({
        success: true,
        message: "Berkas APK berhasil diproses.",
        data: {
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          fileSizeBytes: uploadResult.fileSizeBytes,
          downloadUrl: uploadResult.downloadUrl,
        },
      });
    } catch (githubErr: unknown) {
      console.error("Gagal mengunggah ke GitHub Releases:", githubErr);
      const errMsg =
        githubErr instanceof Error ? githubErr.message : "Kegagalan komunikasi dengan GitHub API.";

      return NextResponse.json(
        {
          success: false,
          message: `Gagal memproses berkas APK: ${errMsg}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memproses unggahan berkas." },
      { status: 500 }
    );
  }
}
