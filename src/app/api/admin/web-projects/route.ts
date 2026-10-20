import { NextRequest, NextResponse } from "next/server";
import { WebProjectService } from "@/services/web-project.service";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    const project = await WebProjectService.getWebProjectById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Projek web dengan ID tersebut tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: project });
  }

  const projects = await WebProjectService.getAllWebProjects();
  const stats = await WebProjectService.getStats();

  return NextResponse.json({ success: true, data: projects, stats });
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

    if (!body.name || !body.description) {
      return NextResponse.json(
        { success: false, message: "Nama projek web dan deskripsi singkat wajib diisi." },
        { status: 400 }
      );
    }

    const id =
      body.id ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

    const existing = await WebProjectService.getWebProjectById(id);
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Projek web dengan ID '${id}' sudah ada. Gunakan nama lain.` },
        { status: 400 }
      );
    }

    const newProject = await WebProjectService.createWebProject({
      id,
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl || null,
      technologies: Array.isArray(body.technologies) ? body.technologies : [],
      liveUrl: body.liveUrl || null,
      githubUrl: body.githubUrl || null,
      category: body.category || "Web App",
      featured: Boolean(body.featured),
    });

    return NextResponse.json({
      success: true,
      message: "Projek web berhasil ditambahkan ke database Supabase.",
      data: newProject,
    });
  } catch (error) {
    console.error("Create Web Project Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data projek web ke Supabase." },
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
        { success: false, message: "ID projek web wajib disertakan untuk pembaruan." },
        { status: 400 }
      );
    }

    const updated = await WebProjectService.updateWebProject(id, updateData);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Projek web tidak ditemukan di database Supabase." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data projek web berhasil diperbarui di Supabase.",
      data: updated,
    });
  } catch (error) {
    console.error("Update Web Project Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data projek web di Supabase." },
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
      { success: false, message: "Parameter ID projek web wajib disertakan." },
      { status: 400 }
    );
  }

  const deleted = await WebProjectService.deleteWebProject(id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Projek web tidak ditemukan atau gagal dihapus dari Supabase." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Projek web berhasil dihapus dari database Supabase.",
  });
}
