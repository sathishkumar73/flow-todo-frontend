'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BlogPost, formatDate } from '@/lib/blog'

interface BlogCardProps {
  post: BlogPost
  source?: 'blog_listing' | 'related_posts' | 'homepage'
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl overflow-hidden border border-white/[0.07] hover:border-blue-500/40 transition-all duration-300"
      style={{ background: '#0C0C1D' }}
    >
      <div className="relative h-48 overflow-hidden">
        {post.featured_image ? (
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(124,58,237,0.2) 100%)' }}
          >
            <svg className="w-12 h-12 opacity-30" fill="none" stroke="#60A5FA" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 rounded-full text-xs font-semibold capitalize"
            style={{ background: 'rgba(37,99,235,0.15)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.3)' }}>
            {post.category.replace('-', ' ')}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'rgba(232,232,240,0.38)' }}>
          <span>{post.author_name}</span>
          <span>·</span>
          <time dateTime={post.published_at || post.created_at}>
            {formatDate(post.published_at || post.created_at)}
          </time>
          {post.read_time && <><span>·</span><span>{post.read_time} min read</span></>}
        </div>

        <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors"
          style={{ color: '#E8E8F0' }}>
          {post.title}
        </h3>

        <p className="text-sm line-clamp-3 mb-4" style={{ color: 'rgba(232,232,240,0.62)' }}>
          {post.excerpt}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded text-xs"
                style={{ background: 'rgba(37,99,235,0.1)', color: '#93C5FD' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <span className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
          style={{ color: '#60A5FA' }}>
          Read more
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
