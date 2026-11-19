import { NextRequest, NextResponse } from "next/server";
import { AppStorageService } from "@/services/app-storage.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  try {
    const apps = await AppStorageService.getPublicCatalogApps({
      throwOnError: true,
    });
    return NextResponse.json(
      { success: true, data: apps },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Katalog aplikasi sedang tidak tersedia sementara." },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
