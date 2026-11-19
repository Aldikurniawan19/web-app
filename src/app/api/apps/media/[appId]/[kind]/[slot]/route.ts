import { NextRequest, NextResponse } from "next/server";
import { AppStorageService } from "@/services/app-storage.service";

export const runtime = "nodejs";

/**
 * GET /api/apps/media/[appId]/[kind]/[slot]
 * Mengubah ikon & tangkapan layar base64 menjadi respons biner HTTP yang dapat di-cache browser & CDN.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ appId: string; kind: string; slot: string }> }
) {
  const { appId, kind, slot } = await context.params;

  if (kind !== "icon" && kind !== "screenshot") {
    return NextResponse.json(
      { success: false, message: "Tipe media tidak valid." },
      { status: 400 }
    );
  }

  let media;
  try {
    media = await AppStorageService.getAppMediaBinary(appId, kind, slot);
  } catch {
    return NextResponse.json(
      { success: false, message: "Media sedang tidak tersedia sementara." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!media) {
    return NextResponse.json(
      { success: false, message: "Media tidak ditemukan." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  if ("redirectUrl" in media) {
    return NextResponse.redirect(new URL(media.redirectUrl, request.url), {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  }

  const vTag = new URL(request.url).searchParams.get("v") || "1";
  const etag = `"${appId}-${kind}-${slot}-${vTag}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }

  return new NextResponse(new Uint8Array(media.buffer), {
    status: 200,
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(media.buffer.length),
      ETag: etag,
      "Cache-Control":
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
