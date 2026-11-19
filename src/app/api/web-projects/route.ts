import { NextResponse } from "next/server";
import { WebProjectService } from "@/services/web-project.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const projects = await WebProjectService.getPublicWebProjects({
      throwOnError: true,
    });
    return NextResponse.json(
      { success: true, data: projects },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Katalog projek web sedang tidak tersedia sementara." },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
