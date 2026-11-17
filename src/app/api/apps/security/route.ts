import { NextRequest, NextResponse } from "next/server";
import { ApkSecurityService } from "@/services/apk-security.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

/**
 * GET /api/apps/security?appId=xxx&version=xxx
 * Endpoint publik (read-only) untuk menampilkan hasil verifikasi keamanan APK.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId")?.trim();
  const version = searchParams.get("version")?.trim() || undefined;

  if (!appId) {
    return NextResponse.json(
      { success: false, message: "Parameter appId wajib disertakan." },
      { status: 400 }
    );
  }

  try {
    const report = await ApkSecurityService.getSecurityReport(appId, version, {
      syncPending: false,
    });

    return NextResponse.json(
      { success: true, data: report },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Laporan keamanan aplikasi belum dapat dimuat." },
      { status: 500 }
    );
  }
}
