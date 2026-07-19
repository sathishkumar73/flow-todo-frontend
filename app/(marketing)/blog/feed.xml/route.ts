import { getBlogPosts } from "@/lib/blog";

export const revalidate = 3600;

const BASE = "https://flowtodo.app";

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { posts } = await getBlogPosts({ limit: 50 });

  const items = posts
    .map((post) => {
      const url = `${BASE}/blog/${post.slug}`;
      const pubDate = new Date(
        post.published_at || post.created_at
      ).toUTCString();
      const description = escapeXml(
        post.excerpt ?? post.seo_description ?? post.title
      );
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>hello@flowtodo.app (${escapeXml(post.author_name)})</author>
      <category>${escapeXml(post.category)}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Flow Todo Blog — Productivity &amp; Prioritization Guides</title>
    <link>${BASE}/blog</link>
    <description>Guides on task prioritization, Eisenhower Matrix, ADHD productivity, and the systems that actually work.</description>
    <language>en-us</language>
    <copyright>© ${new Date().getFullYear()} Flow Todo</copyright>
    <atom:link href="${BASE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
