import { NextRequest, NextResponse } from "next/server";
import { GithubReleaseService } from "@/services/github-release.service";
import { AppStorageService } from "@/services/app-storage.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/apps/downloads?appId=...
 *
 * Mengambil total download dan breakdown unduhan per versi/aset
 * dari repositori GitHub Releases.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");
    const githubTagPrefix = searchParams.get("githubTagPrefix") || undefined;

    if (appId) {
      // Ambil metadata aplikasi untuk nama berkas APK
      const app = await AppStorageService.getAppById(appId);
      const stats = await GithubReleaseService.getAppDownloadStats({
        appId,
        appName: app?.name,
        githubTagPrefix,
        apkFileName: app?.apkFileName,
        apkUrl: app?.apkUrl,
      });

      return NextResponse.json(
        {
          success: true,
          data: stats,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        }
      );
    }

    // Jika tanpa parameter appId, ambil stats untuk seluruh aplikasi
    const allApps = await AppStorageService.getAllApps();
    const statsMap = await GithubReleaseService.getAllAppsDownloadStats(
      allApps.map((a) => ({
        id: a.id,
        name: a.name,
        apkFileName: a.apkFileName,
        apkUrl: a.apkUrl,
      }))
    );

    return NextResponse.json(
      {
        success: true,
        data: statsMap,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[API Downloads Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghitung statistik unduhan dari GitHub Releases.",
      },
      { status: 500 }
    );
  }
}
