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
 * GET /api/admin/apps/versions?appId=xxx
 * Mengambil daftar riwayat versi APK untuk satu aplikasi (admin only).
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId");

  if (!appId) {
    return NextResponse.json(
      { success: false, message: "Parameter appId wajib disertakan." },
      { status: 400 }
    );
  }

  const versions = await AppStorageService.getVersionsByAppId(appId);
  return NextResponse.json({ success: true, data: versions });
}

/**
 * DELETE /api/admin/apps/versions?id=xxx
 * Menghapus satu versi APK dari riwayat.
 */
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Parameter id versi wajib disertakan." },
      { status: 400 }
    );
  }

  const deleted = await AppStorageService.deleteVersion(id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Versi tidak ditemukan atau gagal dihapus." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Versi APK berhasil dihapus dari riwayat.",
  });
}
