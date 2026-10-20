import { NextResponse } from "next/server";
import { WebProjectService } from "@/services/web-project.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const projects = await WebProjectService.getAllWebProjects();
  return NextResponse.json(
    { success: true, data: projects },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
