import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { GithubReleaseService } from "@/services/github-release.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan. Sesi tidak valid." },
      { status: 401 }
    );
  }

  try {
    const releases = await GithubReleaseService.fetchAllReleases(true);
    
    // Kumpulkan seluruh aset APK dari semua rilis
    const assetsList: Array<{
      id: number;
      name: string;
      size: number;
      formattedSize: string;
      downloadUrl: string;
      downloadCount: number;
      releaseTag: string;
      createdAt: string;
    }> = [];

    for (const rel of releases) {
      if (Array.isArray(rel.assets)) {
        for (const asset of rel.assets) {
          const name = asset.name || "";
          if (name.toLowerCase().endsWith(".apk")) {
            const sizeInBytes = typeof asset.size === "number" ? asset.size : 0;
            const sizeInMb = (sizeInBytes / (1024 * 1024)).toFixed(1);
            assetsList.push({
              id: asset.id,
              name,
              size: sizeInBytes,
              formattedSize: `${sizeInMb} MB`,
              downloadUrl:
                asset.browser_download_url ||
                `https://github.com/${process.env.GITHUB_REPO_OWNER || "Aldikurniawan19"}/${
                  process.env.GITHUB_REPO_NAME || "app-release"
                }/releases/download/${rel.tag_name}/${name}`,
              downloadCount: typeof asset.download_count === "number" ? asset.download_count : 0,
              releaseTag: rel.tag_name || "apk-releases",
              createdAt: asset.created_at || rel.created_at || "",
            });
          }
        }
      }
    }

    // Urutkan aset dari yang paling baru
    assetsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: assetsList,
    });
  } catch (error) {
    console.error("Gagal mengambil aset GitHub Release:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat daftar aset dari GitHub Releases.",
      },
      { status: 500 }
    );
  }
}
