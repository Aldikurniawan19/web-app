import { NextRequest, NextResponse } from "next/server";
import { WebProjectService } from "@/services/web-project.service";

export const runtime = "nodejs";

/**
 * GET /api/web-projects/media/[projectId]
 * Mengubah gambar base64 projek web menjadi respons biner HTTP yang dapat di-cache.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const media = await WebProjectService.getProjectImageBinary(projectId);

  if (!media) {
    return NextResponse.json(
      { success: false, message: "Gambar projek web tidak ditemukan." },
      { status: 404 }
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
  const etag = `"web-${projectId}-${vTag}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }

  return new NextResponse(new Uint8Array(media.buffer), {
    status: 200,
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(media.buffer.length),
      ETag: etag,
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
