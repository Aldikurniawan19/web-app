import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  AUTH_COOKIE_NAME,
  generateSessionToken,
  verifySessionToken,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isValid = verifySessionToken(token);

  if (!isValid) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: { username: ADMIN_USERNAME, role: "Super Administrator" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, username, password } = body;

    // Aksi Logout
    if (action === "logout") {
      const response = NextResponse.json({ success: true, message: "Berhasil logout." });
      response.cookies.set(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    // Aksi Login
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: "Kredensial tidak valid. Silakan periksa kembali." },
        { status: 401 }
      );
    }

    // Buat token sesi
    const token = generateSessionToken(username);
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: { username: ADMIN_USERNAME, role: "Super Administrator" },
    });

    // Pasang cookie HTTP-only yang aman
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return response;
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal pada server autentikasi." },
      { status: 500 }
    );
  }
}
