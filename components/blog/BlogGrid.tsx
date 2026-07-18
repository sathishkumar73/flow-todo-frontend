import { BlogPost } from '@/lib/blog'
import BlogCard from './BlogCard'

interface BlogGridProps {
  posts: BlogPost[]
  source?: 'blog_listing' | 'related_posts' | 'homepage'
}

export default function BlogGrid({ posts, source = 'blog_listing' }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-14 h-14 mx-auto mb-4 opacity-20" fill="none" stroke="#E8E8F0" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
        </svg>
        <p className="font-semibold" style={{ color: 'rgba(232,232,240,0.38)' }}>No posts yet — check back soon.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map(post => (
        <BlogCard key={post.id} post={post} source={source} />
      ))}
    </div>
  )
}
