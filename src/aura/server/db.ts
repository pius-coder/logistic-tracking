import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function normalizePostgresSslMode(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");
    if (sslmode && ["prefer", "require", "verify-ca"].includes(sslmode)) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
  } catch {
    // Keep the original value so the underlying driver reports invalid URLs.
  }

  return connectionString;
}

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("[aura] DATABASE_URL is required to initialize Prisma.");
}

const connectionString = normalizePostgresSslMode(rawConnectionString);

const globalForPrisma = globalThis as unknown as {
  auraPrisma?: PrismaClient;
};

const adapter = new PrismaPg({ connectionString });

export const db =
  globalForPrisma.auraPrisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.auraPrisma = db;
}

export type AuraDb = typeof db;
