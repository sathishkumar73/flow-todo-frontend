const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail_url: string | null;
  category: string;
  tags: string[];
  featured_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  view_count: number;
  read_time: number | null;
  author_name: string;
  author_avatar: string | null;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  totalPages: number;
  totalPosts: number;
}

export async function getBlogPosts({
  page = 1,
  category,
  search,
  limit = 12,
}: {
  page?: number;
  category?: string;
  search?: string;
  limit?: number;
}): Promise<BlogPostsResponse> {
  try {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (category && category !== "all") params.set("category", category);
    if (search) params.set("search", search);

    const res = await fetch(`${API_URL}/api/v1/blog/posts?${params}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { posts: [], totalPages: 0, totalPosts: 0 };
    const data = await res.json();
    return {
      posts: data.posts || [],
      totalPages: data.total_pages || 0,
      totalPosts: data.total_posts || 0,
    };
  } catch {
    return { posts: [], totalPages: 0, totalPosts: 0 };
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/blog/posts/${slug}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<{ name: string; slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/blog/categories`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch {
    return [];
  }
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/blog/posts/${slug}/related?limit=${limit}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getAllBlogSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/blog/posts?limit=1000`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts || []).map((p: BlogPost) => ({
      slug: p.slug,
      updatedAt: p.updated_at || p.published_at || p.created_at,
    }));
  } catch {
    return [];
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
