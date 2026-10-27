import { NextRequest, NextResponse } from "next/server";
import { AppStorageService } from "@/services/app-storage.service";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * POST /api/admin/apps/new-version
 * Endpoint khusus untuk merilis / mengunggah versi baru aplikasi secara manual
 * dengan tautan berkas dari GitHub Action.
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
    const { appId, version, apkUrl, apkFileName, fileSize, changelog, lastUpdated } = body;

    if (!appId || typeof appId !== "string" || !appId.trim()) {
      return NextResponse.json(
        { success: false, message: "Aplikasi target wajib dipilih." },
        { status: 400 }
      );
    }

    if (!version || typeof version !== "string" || !version.trim()) {
      return NextResponse.json(
        { success: false, message: "Nomor versi baru wajib diisi (misal: 1.0.1)." },
        { status: 400 }
      );
    }

    if (!apkUrl || typeof apkUrl !== "string" || !apkUrl.trim()) {
      return NextResponse.json(
        { success: false, message: "Tautan berkas APK dari GitHub Action wajib diisi." },
        { status: 400 }
      );
    }

    // Eksekusi rilis versi baru di database
    const updatedApp = await AppStorageService.releaseNewVersion({
      appId: appId.trim(),
      version: version.trim(),
      apkUrl: apkUrl.trim(),
      apkFileName: apkFileName?.trim(),
      fileSize: fileSize?.trim(),
      changelog: changelog?.trim(),
      lastUpdated: lastUpdated?.trim(),
    });

    return NextResponse.json({
      success: true,
      message: `Versi v${updatedApp.version} untuk aplikasi "${updatedApp.name}" berhasil dirilis dengan tautan GitHub Action!`,
      data: updatedApp,
    });
  } catch (error: unknown) {
    console.error("Release New Version Error:", error);
    const errMsg = error instanceof Error ? error.message : "Gagal menerbitkan versi baru aplikasi.";
    return NextResponse.json(
      { success: false, message: errMsg },
      { status: 500 }
    );
  }
}
