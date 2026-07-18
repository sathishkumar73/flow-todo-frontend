import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { getBlogPost, getRelatedPosts, getAllBlogSlugs, formatDate } from '@/lib/blog'
import BlogGrid from '@/components/blog/BlogGrid'

const BlogContent = dynamic(() => import('@/components/blog/BlogContent'))

export const revalidate = 86400

const BASE = 'https://flowtodo.app'

function toAbsolute(url?: string | null) {
  if (!url) return undefined
  return url.startsWith('http') ? url : `${BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: { absolute: post.seo_title || post.title },
    description: post.seo_description || post.excerpt || undefined,
    alternates: { canonical: `${BASE}/blog/${post.slug}` },
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      type: 'article',
      url: `${BASE}/blog/${post.slug}`,
      publishedTime: post.published_at || undefined,
      authors: [post.author_name],
      images: toAbsolute(post.featured_image) ? [{ url: toAbsolute(post.featured_image)!, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      images: toAbsolute(post.featured_image) ? [toAbsolute(post.featured_image)!] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, relatedPosts] = await Promise.all([getBlogPost(slug), getRelatedPosts(slug, 3)])
  if (!post) notFound()

  const articleLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: post.title, description: post.excerpt,
    image: toAbsolute(post.featured_image),
    datePublished: post.published_at, dateModified: post.updated_at,
    author: { '@type': 'Person', name: post.author_name, url: BASE },
    publisher: { '@type': 'Organization', name: 'Flow Todo', url: BASE, logo: { '@type': 'ImageObject', url: `${BASE}/icon.svg` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/blog/${post.slug}` },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${BASE}/blog/${post.slug}` },
    ],
  }

  const border = 'rgba(255,255,255,0.07)'
  const ink = '#E8E8F0'
  const ink2 = 'rgba(232,232,240,0.62)'
  const ink3 = 'rgba(232,232,240,0.38)'

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="min-h-screen" style={{ background: '#07070F' }}>
        {/* Header */}
        <header className="border-b" style={{ borderColor: border, background: '#0C0C1D' }}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-14">
              <Link href="/blog" className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: ink3 }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Blog
              </Link>
              <Link href="/" className="text-base font-bold"
                style={{ background: 'linear-gradient(135deg,#60A5FA,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Flow Todo
              </Link>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="border-b" style={{ borderColor: border, background: '#0C0C1D' }}>
          <div className="container mx-auto px-4 md:px-6 py-2">
            <nav className="flex items-center gap-1 text-xs" style={{ color: ink3 }}>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <span>›</span>
              <span className="truncate max-w-[200px]" style={{ color: ink2 }}>{post.title}</span>
            </nav>
          </div>
        </div>

        {/* Article */}
        <article className="container mx-auto px-4 md:px-6 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Category */}
            <Link href={`/blog/category/${post.category}`}
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize mb-4 transition-colors"
              style={{ background: 'rgba(37,99,235,0.15)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.3)' }}>
              {post.category.replace('-', ' ')}
            </Link>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ color: ink }}>
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl mb-8 leading-relaxed" style={{ color: ink2 }}>{post.excerpt}</p>
            )}

            {/* Author bar */}
            <div className="flex items-center gap-4 mb-8 pb-8" style={{ borderBottom: `1px solid ${border}` }}>
              {post.author_avatar ? (
                <Image src={post.author_avatar} alt={post.author_name} width={44} height={44} className="rounded-full" />
              ) : (
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}>
                  {post.author_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-sm" style={{ color: ink }}>{post.author_name}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: ink3 }}>
                  <time dateTime={post.published_at || post.created_at}>
                    {formatDate(post.published_at || post.created_at)}
                  </time>
                  {post.read_time && <><span>·</span><span>{post.read_time} min read</span></>}
                  <span>·</span><span>{post.view_count} views</span>
                </div>
              </div>
            </div>

            {/* Featured image */}
            {post.featured_image && (
              <div className="relative aspect-video rounded-xl overflow-hidden mb-10">
                <Image src={post.featured_image} alt={post.title} fill
                  sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
              </div>
            )}

            {/* Content */}
            <BlogContent content={post.content} slug={slug} />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-8" style={{ borderTop: `1px solid ${border}` }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: ink3 }}>Tags</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm"
                      style={{ background: 'rgba(255,255,255,0.05)', color: ink2, border: `1px solid ${border}` }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8" style={{ borderTop: `1px solid ${border}` }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: ink3 }}>Share</p>
              <div className="flex gap-3">
                {[
                  { label: 'X / Twitter', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${BASE}/blog/${slug}`)}` },
                  { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${BASE}/blog/${slug}`)}` },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', color: ink2, border: `1px solid ${border}` }}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t py-14" style={{ borderColor: border, background: '#0C0C1D' }}>
            <div className="container mx-auto px-4 md:px-6">
              <h2 className="text-2xl font-bold text-center mb-8" style={{ color: ink }}>Related Posts</h2>
              <div className="max-w-5xl mx-auto">
                <BlogGrid posts={relatedPosts} source="related_posts" />
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border-t py-14 text-center" style={{ borderColor: border }}>
          <div className="container mx-auto px-4 max-w-xl">
            <h3 className="text-2xl font-bold mb-3" style={{ color: ink }}>
              Ready to focus on what actually matters?
            </h3>
            <p className="mb-6" style={{ color: ink2 }}>
              Flow Todo auto-scores every task so you always know your top 10. Free to start.
            </p>
            <Link href="/app"
              className="inline-block px-8 py-3 rounded-lg font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)' }}>
              Try Flow Todo Free
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
