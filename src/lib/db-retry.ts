/**
 * Helper auto-retry untuk query Prisma ketika terjadi gangguan koneksi transien
 * atau lonjakan sementara pool koneksi PostgreSQL/Supabase.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  contextLabel = "Prisma Retry"
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient =
        msg.includes("Connection terminated") ||
        msg.includes("closed") ||
        msg.includes("timeout") ||
        msg.includes("57014") ||
        msg.includes("ECONNRESET") ||
        msg.includes("ENOTFOUND") ||
        msg.includes("connection pool") ||
        msg.includes("max clients") ||
        msg.includes("EMAXCONNSESSION");

      if (isTransient && attempt < maxRetries) {
        console.warn(
          `[${contextLabel}] Percobaan ke-${attempt + 1} setelah error: ${msg.slice(0, 90)}`
        );
        await new Promise((r) => setTimeout(r, 250 * attempt));
        continue;
      }
      throw err;
    }
  }
}
