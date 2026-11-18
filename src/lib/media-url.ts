/**
 * Memeriksa apakah URL gambar merupakan jalur media lokal/API internal
 * yang terdaftar di localPatterns next.config.ts untuk optimasi next/image.
 */
export function isLocalOptimizedMediaUrl(src?: string | null): src is string {
  if (!src) return false;
  return (
    src.startsWith("/api/apps/media/") ||
    src.startsWith("/api/web-projects/media/") ||
    src.startsWith("/assets/")
  );
}
