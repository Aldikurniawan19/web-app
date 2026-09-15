import { NextRequest, NextResponse } from "next/server";
import { AppStorageService } from "@/services/app-storage.service";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Helper untuk validasi autentikasi admin di API
function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan. Sesi tidak valid atau telah berakhir." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const app = await AppStorageService.getAppById(id);
    if (!app) {
      return NextResponse.json(
        { success: false, message: "Aplikasi dengan ID tersebut tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: app });
  }

  const apps = await AppStorageService.getAllApps();
  const stats = await AppStorageService.getStats();

  return NextResponse.json({ success: true, data: apps, stats });
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan. Sesi tidak valid atau telah berakhir." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validasi field utama
    if (!body.name || !body.category || !body.description) {
      return NextResponse.json(
        { success: false, message: "Nama aplikasi, kategori, dan deskripsi wajib diisi." },
        { status: 400 }
      );
    }

    const id = body.id || body.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const existing = await AppStorageService.getAppById(id);
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Aplikasi dengan ID '${id}' sudah ada. Gunakan nama lain.` },
        { status: 400 }
      );
    }

    const systemRequirements = {
      os: body.systemRequirements?.os || "Android 8.0+",
      ram: body.systemRequirements?.ram || "2 GB RAM",
      storage: body.systemRequirements?.storage || "50 MB",
    };

    const screenshots =
      Array.isArray(body.screenshots) && body.screenshots.length > 0
        ? body.screenshots
        : [
            {
              id: "s1",
              title: "Tampilan Utama",
              description: "Antarmuka intuitif dan responsif.",
              type: "light" as const,
            },
          ];

    const newApp = await AppStorageService.createApp({
      id,
      name: body.name,
      tagline: body.tagline || body.name,
      description: body.description,
      longDescription: body.longDescription || body.description,
      category: body.category,
      rating: typeof body.rating === "number" ? body.rating : 5.0,
      reviewsCount: body.reviewsCount || "Baru",
      downloadsCount: body.downloadsCount || "10 rb+",
      lastUpdated: body.lastUpdated,
      fileSize: body.fileSize || "15.0 MB",
      version: body.version || "1.0.0",
      developer: body.developer || "AppHub Studio",
      platforms: ["android"],
      iconUrl: body.iconUrl || null,
      iconType: body.iconType || "document",
      iconColor: body.iconColor || "bg-blue-500",
      features: Array.isArray(body.features) ? body.features : [],
      screenshots,
      systemRequirements,
      apkUrl: body.apkUrl || null,
      apkFileName: body.apkFileName || null,
    });

    return NextResponse.json({
      success: true,
      message: "Aplikasi berhasil ditambahkan ke database Supabase.",
      data: newApp,
    });
  } catch (error) {
    console.error("Create App Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data aplikasi ke Supabase." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan. Sesi tidak valid atau telah berakhir." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID aplikasi wajib disertakan untuk pembaruan." },
        { status: 400 }
      );
    }

    const updatedApp = await AppStorageService.updateApp(id, updateData);
    if (!updatedApp) {
      return NextResponse.json(
        { success: false, message: "Aplikasi tidak ditemukan di database Supabase." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data aplikasi dan deskripsi berhasil diperbarui di Supabase.",
      data: updatedApp,
    });
  } catch (error) {
    console.error("Update App Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data aplikasi di Supabase." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan. Sesi tidak valid atau telah berakhir." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Parameter ID aplikasi wajib disertakan." },
      { status: 400 }
    );
  }

  const deleted = await AppStorageService.deleteApp(id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Aplikasi tidak ditemukan atau gagal dihapus dari Supabase." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Aplikasi berhasil dihapus dari database Supabase.",
  });
}
