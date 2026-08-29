// [Owner: A] Prisma client singleton. Import this everywhere instead of
// `new PrismaClient()` — Next.js hot-reload otherwise opens a new DB
// connection on every file save in dev.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
