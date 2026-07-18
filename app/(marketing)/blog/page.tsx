import { Suspense } from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { getBlogPosts, getCategories } from '@/lib/blog'
import BlogGrid from '@/components/blog/BlogGrid'
import Pagination from '@/components/blog/Pagination'

export const revalidate = 300

const BASE = 'https://flowtodo.app'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string; category?: string }> }): Promise<Metadata> {
  const { page = '1' } = await searchParams
  return {
    title: { absolute: 'Flow Todo Blog — Productivity & Prioritization Guides' },
    description: 'Learn how to stop drowning in tasks and start doing what matters. Guides on Eisenhower Matrix, Impact/Effort scoring, ADHD productivity, and more.',
    alternates: { canonical: `${BASE}/blog` },
    ...(parseInt(page) > 1 && { robots: 'noindex, follow' }),
    openGraph: {
      title: 'Flow Todo Blog — Productivity & Prioritization Guides',
      description: 'Practical guides on task prioritization, Eisenhower Matrix, and focus productivity.',
      type: 'website',
      url: `${BASE}/blog`,
    },
  }
}

const CATEGORIES = [
  { name: 'All', slug: 'all' },
  { name: 'Prioritization', slug: 'prioritization-frameworks' },
  { name: 'Alternatives', slug: 'alternatives' },
  { name: 'ADHD & Focus', slug: 'adhd-focus' },
  { name: 'Productivity', slug: 'productivity' },
]

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>
}) {
  const { page = '1', category, search } = await searchParams
  const currentPage = Math.max(1, parseInt(page))

  const [{ posts, totalPages, totalPosts }, categories] = await Promise.all([
    getBlogPosts({ page: currentPage, category, search, limit: 9 }),
    getCategories(),
  ])

  const allCategories = categories.length > 0
    ? [{ name: 'All', slug: 'all' }, ...categories]
    : CATEGORIES

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Flow Todo Blog',
    description: 'Productivity guides on task prioritization, Eisenhower Matrix, and focus.',
    url: `${BASE}/blog`,
    publisher: { '@type': 'Organization', name: 'Flow Todo', url: BASE },
  }

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen" style={{ background: '#07070F' }}>
        {/* Hero */}
        <section className="border-b py-16 text-center" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
              style={{ background: 'rgba(37,99,235,0.1)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.2)' }}>
              Productivity Guides
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#E8E8F0' }}>
              Work smarter,{' '}
              <span style={{
                background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>not harder</span>
            </h1>
            <p className="text-lg" style={{ color: 'rgba(232,232,240,0.62)' }}>
              Guides on task prioritization, Eisenhower Matrix, ADHD productivity, and the systems that actually work.
            </p>
          </div>
        </section>

        {/* Category Pills */}
        <div className="border-b sticky top-0 z-10" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#07070F' }}>
          <div className="container mx-auto px-4 md:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-none">
            {allCategories.map(cat => {
              const isActive = (!category && cat.slug === 'all') || category === cat.slug
              return (
                <Link key={cat.slug}
                  href={cat.slug === 'all' ? '/blog' : `/blog/category/${cat.slug}`}
                  className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={isActive
                    ? { background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(232,232,240,0.62)', border: '1px solid rgba(255,255,255,0.07)' }
                  }>
                  {cat.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Posts */}
        <main className="container mx-auto px-4 md:px-6 py-12 max-w-6xl">
          {totalPosts > 0 && (
            <p className="text-sm mb-8" style={{ color: 'rgba(232,232,240,0.38)' }}>
              {totalPosts} article{totalPosts !== 1 ? 's' : ''}{category ? ` in "${category}"` : ''}
            </p>
          )}
          <BlogGrid posts={posts} />
          <Suspense>
            <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/blog" />
          </Suspense>
        </main>

        {/* CTA */}
        <section className="border-t py-16 text-center" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#E8E8F0' }}>
              Ready to prioritize what matters?
            </h2>
            <p className="mb-6" style={{ color: 'rgba(232,232,240,0.62)' }}>
              Flow Todo surfaces your top 10 tasks automatically — no setup, no decision fatigue.
            </p>
            <Link href="/app"
              className="inline-block px-8 py-3 rounded-lg font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)' }}>
              Try Flow Todo Free
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
