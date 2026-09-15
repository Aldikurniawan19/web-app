import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Konfigurasi koneksi database Supabase PostgreSQL via Prisma 7 Driver Adapter.
 *
 * Menggunakan pg.Pool dengan konfigurasi pool yang dioptimalkan untuk
 * koneksi ke Supabase Pooler (mode Session/Transaction).
 */

const connectionString =
  process.env.DIRECT_URL || process.env.DATABASE_URL || "";

const pool = new pg.Pool({
  connectionString,
  max: 3,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle: true,
});

pool.on("error", (err) => {
  console.error("[Database Pool] Koneksi pool error:", err.message);
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
