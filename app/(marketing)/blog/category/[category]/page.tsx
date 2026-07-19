import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getBlogPosts } from '@/lib/blog'
import BlogGrid from '@/components/blog/BlogGrid'
import Pagination from '@/components/blog/Pagination'

export const revalidate = 3600

const BASE = 'https://flowtodo.app'

interface Props { params: Promise<{ category: string }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category } = await params
  const { page = '1' } = await searchParams
  const name = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const title = `${name} — Flow Todo Blog`
  const description = `Productivity guides on ${name.toLowerCase()} from Flow Todo. Practical tips for task management and focus.`
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${BASE}/blog/category/${category}` },
    ...(parseInt(page) > 1 && { robots: 'noindex, follow' }),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE}/blog/category/${category}`,
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page))
  const name = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const { posts, totalPages, totalPosts } = await getBlogPosts({ page: currentPage, category, limit: 6 }).catch(() => ({ posts: [], totalPages: 0, totalPosts: 0 }))

  const border = 'rgba(255,255,255,0.07)'
  const ink = '#E8E8F0'
  const ink2 = 'rgba(232,232,240,0.62)'
  const ink3 = 'rgba(232,232,240,0.38)'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${name} — Flow Todo Blog`,
    description: `Productivity guides on ${name.toLowerCase()} from Flow Todo.`,
    url: `${BASE}/blog/category/${category}`,
    publisher: { '@type': 'Organization', name: 'Flow Todo', url: BASE },
  }

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="min-h-screen" style={{ background: '#07070F' }}>
      {/* Header */}
      <section className="border-b py-12 text-center" style={{ borderColor: border }}>
        <div className="container mx-auto px-4 max-w-2xl">
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm mb-6 transition-colors"
            style={{ color: ink3 }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Posts
          </Link>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ background: 'rgba(37,99,235,0.1)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.2)' }}>
            Category
          </div>
          <h1 className="text-3xl md:text-4xl font-bold capitalize" style={{ color: ink }}>{name}</h1>
          {totalPosts > 0 && (
            <p className="mt-3 text-sm" style={{ color: ink3 }}>
              {totalPosts} article{totalPosts !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      <main className="container mx-auto px-4 md:px-6 py-12 max-w-6xl">
        <BlogGrid posts={posts} />
        <Suspense>
          <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={`/blog/category/${category}`} />
        </Suspense>

        {posts.length === 0 && (
          <div className="text-center py-8">
            <Link href="/blog" className="text-sm transition-colors" style={{ color: '#60A5FA' }}>
              ← Back to all posts
            </Link>
          </div>
        )}
      </main>
    </div>
    </>
  )
}
