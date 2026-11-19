/**
 * Memeriksa apakah error database bersifat transien (gangguan jaringan/DNS sementara,
 * koneksi terputus, atau antrean pool sementara) yang aman untuk dicoba ulang.
 */
export function isTransientDbError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("Connection terminated") ||
    msg.includes("closed") ||
    msg.includes("timeout") ||
    msg.includes("57014") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("EAI_AGAIN") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ENETUNREACH") ||
    msg.includes("EHOSTUNREACH") ||
    msg.includes("getaddrinfo") ||
    msg.includes("connection pool") ||
    msg.includes("max clients") ||
    msg.includes("EMAXCONNSESSION")
  );
}

/**
 * Helper auto-retry untuk query Prisma ketika terjadi gangguan koneksi/DNS transien
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

      if (isTransientDbError(err) && attempt < maxRetries) {
        console.warn(
          `[${contextLabel}] Percobaan ke-${attempt + 1} setelah gangguan jaringan/DB sementara: ${msg.slice(0, 90)}`
        );
        await new Promise((r) => setTimeout(r, 350 * attempt));
        continue;
      }
      throw err;
    }
  }
}
