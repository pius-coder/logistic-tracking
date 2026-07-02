import type { MetadataRoute } from "next";

const BASE_URL = process.env.AURA_APP_URL || "https://jc-import-express.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "CCBot", disallow: "/" },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
