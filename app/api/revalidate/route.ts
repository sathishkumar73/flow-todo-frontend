import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token || token !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { paths, tags, slugs } = body as {
    paths?: string[];
    tags?: string[];
    slugs?: string[];
  };

  if (tags) {
    for (const tag of tags) revalidateTag(tag);
  }
  if (paths) {
    for (const path of paths) revalidatePath(path);
  }
  if (slugs) {
    for (const slug of slugs) {
      revalidateTag(`blog-post-${slug}`);
      revalidatePath(`/blog/${slug}`);
    }
    revalidateTag("blog-posts");
    revalidatePath("/blog");
  }

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
