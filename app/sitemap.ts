import type { MetadataRoute } from "next";
import { getAllBlogSlugs, getCategories } from "@/lib/blog";

const BASE = "https://flowtodo.app";

export const revalidate = 86400; // revalidate every 24 h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const [slugResult, catResult] = await Promise.allSettled([
    getAllBlogSlugs(),
    getCategories(),
  ]);

  const blogSlugs = slugResult.status === "fulfilled" ? slugResult.value : [];
  const blogCategories = catResult.status === "fulfilled" ? catResult.value : [];

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/pricing`,     lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`,        lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/privacy`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,       lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = blogCategories.map((cat) => ({
    url: `${BASE}/blog/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map(({ slug, updatedAt }) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: updatedAt || now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...blogPages];
}
