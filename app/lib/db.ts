import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isDevelopment = process.env.NODE_ENV !== "production";
const datasourceUrl =
  isDevelopment && process.env.DIRECT_URL ? process.env.DIRECT_URL : process.env.DATABASE_URL;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (isDevelopment) {
  globalForPrisma.prisma = db;
}
