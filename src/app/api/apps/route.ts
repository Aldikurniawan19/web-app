import { NextResponse } from "next/server";
import { AppStorageService } from "@/services/app-storage.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const apps = await AppStorageService.getAllApps();
  return NextResponse.json({ success: true, data: apps });
}

