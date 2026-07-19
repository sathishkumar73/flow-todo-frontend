import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/sign-in/", "/sign-up/", "/_next/"],
      },
      {
        // AI crawlers — allow public content, block private
        userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended", "cohere-ai"],
        allow: ["/", "/blog", "/pricing", "/privacy", "/terms"],
        disallow: ["/api/", "/dashboard/", "/sign-in/", "/sign-up/"],
      },
    ],
    sitemap: "https://flowtodo.app/sitemap.xml",
  };
}
