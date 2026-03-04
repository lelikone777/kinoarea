import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isDevelopment = process.env.NODE_ENV !== "production";

function maybeNormalizeNeonPoolerUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    const isNeonPooler = parsed.hostname.includes("-pooler.") && parsed.hostname.endsWith(".neon.tech");
    if (!isNeonPooler) {
      return rawUrl;
    }
    if (!parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "15");
    }
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function resolveDatasourceUrl() {
  const preferredUrl = isDevelopment
    ? process.env.DIRECT_URL ?? process.env.DATABASE_URL
    : process.env.DATABASE_URL ?? process.env.DIRECT_URL;

  if (!preferredUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  return maybeNormalizeNeonPoolerUrl(preferredUrl);
}

const datasourceUrl = resolveDatasourceUrl();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (isDevelopment) {
  globalForPrisma.prisma = db;
}
