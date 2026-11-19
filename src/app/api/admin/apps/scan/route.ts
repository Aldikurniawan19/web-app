import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { ApkSecurityService } from "@/services/apk-security.service";
import { AppStorageService } from "@/services/app-storage.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * GET /api/admin/apps/scan?appId=xxx&version=xxx&sync=1
 * Mengambil status pemindaian keamanan APK terbaru dan menyinkronkan status antrean VirusTotal.
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan. Sesi tidak valid atau telah berakhir." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId")?.trim();
  const version = searchParams.get("version")?.trim() || undefined;
  const syncPending = searchParams.get("sync") !== "0";

  if (!appId) {
    return NextResponse.json(
      { success: false, message: "Parameter appId wajib disertakan." },
      { status: 400 }
    );
  }

  try {
    const report = await ApkSecurityService.getSecurityReport(appId, version, {
      syncPending,
    });

    if (report && report.status !== "pending") {
      AppStorageService.invalidateCache();
    }

    return NextResponse.json(
      { success: true, data: report },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal memeriksa status pemindaian APK.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/apps/scan
 * Memicu pemindaian manual APK melalui VirusTotal API v3 dari panel admin.
 */
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan. Sesi tidak valid atau telah berakhir." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const appId = typeof body.appId === "string" ? body.appId.trim() : "";

    if (!appId) {
      return NextResponse.json(
        { success: false, message: "ID aplikasi (appId) wajib diisi." },
        { status: 400 }
      );
    }

    const report = await ApkSecurityService.triggerAdminScan({
      appId,
      version: typeof body.version === "string" ? body.version.trim() : undefined,
      apkUrl: typeof body.apkUrl === "string" ? body.apkUrl.trim() : undefined,
      apkFileName:
        typeof body.apkFileName === "string" ? body.apkFileName.trim() : undefined,
      knownSha256:
        typeof body.knownSha256 === "string" ? body.knownSha256.trim() : undefined,
    });

    AppStorageService.invalidateCache();
    revalidatePath("/");
    revalidatePath("/aplikasi");
    revalidatePath(`/aplikasi/${encodeURIComponent(appId)}`);

    return NextResponse.json({
      success: true,
      message:
        report.status === "pending"
          ? "Berkas APK dikirim ke antrean VirusTotal. Cek ulang beberapa saat lagi."
          : "Pemindaian keamanan APK melalui VirusTotal selesai.",
      data: report,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal menjalankan pemindaian keamanan APK.";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
