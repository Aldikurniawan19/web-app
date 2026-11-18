import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Konfigurasi koneksi database Supabase PostgreSQL via Prisma 7 Driver Adapter.
 *
 * Prioritas runtime menggunakan DATABASE_URL (Supabase Transaction Mode pooler)
 * agar tidak cepat menyentuh batas klien Session Mode pada DIRECT_URL.
 * Baik pg.Pool maupun PrismaClient di-cache pada globalThis agar tidak bocor saat HMR dev.
 */
const connectionString =
  process.env.DATABASE_URL || process.env.DIRECT_URL || "";

const globalForPrisma = globalThis as unknown as {
  pgPoolV2: pg.Pool | undefined;
  prismaV2: PrismaClient | undefined;
};

const pool =
  globalForPrisma.pgPoolV2 ??
  new pg.Pool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 5 : 4,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    allowExitOnIdle: true,
  });

if (!globalForPrisma.pgPoolV2) {
  pool.on("error", (err) => {
    console.error("[Database Pool] Koneksi pool error:", err.message);
  });
  globalForPrisma.pgPoolV2 = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prismaV2 ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (!globalForPrisma.prismaV2) {
  globalForPrisma.prismaV2 = prisma;
}

export default prisma;
