import type React from 'react'

const border = 'rgba(255,255,255,0.07)'

function Shimmer({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: 'rgba(255,255,255,0.07)', ...style }}
    />
  )
}

export default function BlogPostLoading() {
  return (
    <div className="min-h-screen" style={{ background: '#07070F' }}>
      {/* Breadcrumb bar */}
      <div className="border-b" style={{ borderColor: border, background: '#0C0C1D' }}>
        <div className="container mx-auto px-4 md:px-6 py-2 flex items-center gap-2">
          <Shimmer className="h-3 w-10" />
          <span style={{ color: border }}>›</span>
          <Shimmer className="h-3 w-8" />
          <span style={{ color: border }}>›</span>
          <Shimmer className="h-3 w-48" />
        </div>
      </div>

      {/* Article */}
      <article className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Category badge */}
          <Shimmer className="h-6 w-28 rounded-full mb-5" />

          {/* Title */}
          <Shimmer className="h-10 w-full mb-3" />
          <Shimmer className="h-10 w-4/5 mb-6" />

          {/* Excerpt */}
          <Shimmer className="h-5 w-full mb-2" />
          <Shimmer className="h-5 w-3/4 mb-8" />

          {/* Author bar */}
          <div className="flex items-center gap-4 pb-8 mb-8" style={{ borderBottom: `1px solid ${border}` }}>
            <Shimmer className="h-11 w-11 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-3 w-48" />
            </div>
          </div>

          {/* Featured image */}
          <Shimmer className="w-full aspect-video rounded-xl mb-10" />

          {/* Content paragraphs */}
          <div className="space-y-3">
            {[100, 95, 88, 100, 72, 100, 90, 60, 100, 85, 78, 100, 55].map((w, i) => (
              <Shimmer key={i} className="h-4" style={{ width: `${w}%` }} />
            ))}
          </div>

          {/* Second paragraph block */}
          <div className="space-y-3 mt-8">
            {[100, 92, 80, 100, 68].map((w, i) => (
              <Shimmer key={i} className="h-4" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
