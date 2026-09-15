import { NextRequest, NextResponse } from "next/server";
import { AppStorageService } from "@/services/app-storage.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const apps = await AppStorageService.getAllApps();
  return NextResponse.json(
    { success: true, data: apps },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
