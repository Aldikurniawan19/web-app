export const AUTH_COOKIE_NAME = "apphub_admin_session";
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
export const AUTH_SECRET = process.env.AUTH_SECRET || "apphub_secret_key_2026_secure_token";

/**
 * Membuat token sesi admin terverifikasi
 */
export function generateSessionToken(username: string): string {
  const timestamp = Date.now();
  const raw = `${username}:${timestamp}:${AUTH_SECRET}`;
  // Simple base64 encode for safe session cookie
  return Buffer.from(raw).toString("base64");
}

/**
 * Memvalidasi apakah token sesi valid
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 3) return false;

    const [username, timestampStr, secret] = parts;
    if (username !== ADMIN_USERNAME) return false;
    if (secret !== AUTH_SECRET) return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Sesi berlaku selama 7 hari
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAgeMs) return false;

    return true;
  } catch {
    return false;
  }
}
