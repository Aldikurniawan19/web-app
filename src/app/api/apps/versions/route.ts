import { NextRequest, NextResponse } from "next/server";
import { AppStorageService } from "@/services/app-storage.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/apps/versions?appId=xxx
 * Endpoint publik untuk mengambil daftar riwayat versi APK sebuah aplikasi.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId");

  if (!appId) {
    return NextResponse.json(
      { success: false, message: "Parameter appId wajib disertakan." },
      { status: 400 }
    );
  }

  const versions = await AppStorageService.getVersionsByAppId(appId);
  return NextResponse.json(
    { success: true, data: versions },
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
