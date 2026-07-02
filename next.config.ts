import type { NextConfig } from "next";

const APP_HOSTNAMES = (() => {
  const hosts = new Set<string>([
    "placehold.co",
    "api.mapbox.com",
    "flagcdn.com",
    "cdn.jc-import-express.online",
    "admin-m12oryr2fpnu6uw4qspjc11a.jc-import-express.online"
  ]);
  const s3Public = process.env.AURA_S3_PUBLIC_ENDPOINT || process.env.AURA_S3_ENDPOINT;
  if (s3Public) {
    try {
      hosts.add(new URL(s3Public).hostname);
    } catch {
      /* ignore */
    }
  }
  const s3Internal = process.env.AURA_S3_INTERNAL_ENDPOINT;
  if (s3Internal) {
    try {
      hosts.add(new URL(s3Internal).hostname);
    } catch {
      /* ignore */
    }
  }
  const appUrl = process.env.AURA_APP_URL;
  if (appUrl) {
    try {
      hosts.add(new URL(appUrl).hostname);
    } catch {
      /* ignore */
    }
  }
  return [...hosts];
})();

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,

  allowedDevOrigins: ["10.215.217.99", "10.238.48.99"],
  serverExternalPackages: [
    "prisma",
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
  ],
  turbopack: {
    resolveAlias: {
      "@prisma/client/runtime/client": "@prisma/client/runtime/client.mjs",
    },
  },
  images: {
    remotePatterns: APP_HOSTNAMES.flatMap((hostname) => [
      { protocol: "https" as const, hostname },
      { protocol: "http" as const, hostname },
    ]),
  },
};

export default nextConfig;
