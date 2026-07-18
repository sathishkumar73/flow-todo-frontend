'use client'

import DOMPurify from 'dompurify'
import './blog-content.css'

interface BlogContentProps {
  content: string
  slug?: string
}

function buildCTA(): string {
  return `
<div class="blog-mid-cta not-prose my-10 rounded-xl p-6 md:p-8 text-center" style="border:1px solid rgba(37,99,235,0.3);background:linear-gradient(135deg,rgba(37,99,235,0.12) 0%,rgba(124,58,237,0.12) 100%)">
  <p style="color:#E8E8F0;font-size:1.1rem;font-weight:600;margin-bottom:8px">Stop drowning in tasks. Start doing what matters.</p>
  <p style="color:rgba(232,232,240,0.62);font-size:0.875rem;margin-bottom:16px">Flow Todo uses Eisenhower + Impact/Effort scoring to surface only your top 10 tasks — automatically.</p>
  <a href="/app" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#2563EB 0%,#7C3AED 100%);color:#fff;border-radius:8px;font-weight:600;font-size:0.875rem;text-decoration:none">Try Flow Todo Free →</a>
</div>
`
}

function injectCTAs(html: string): string {
  const cta = buildCTA()
  const breakPattern = /(<\/(?:p|h[2-6]|ul|ol|blockquote|table)>)/gi
  const parts = html.split(breakPattern)
  if (parts.length < 6) return html

  const blocks: string[] = []
  for (let i = 0; i < parts.length; i += 2) {
    blocks.push(parts[i] + (parts[i + 1] || ''))
  }
  if (blocks.length < 4) return html

  const pos30 = Math.floor(blocks.length * 0.3)
  const pos65 = Math.floor(blocks.length * 0.65)
  const result: string[] = []
  for (let i = 0; i < blocks.length; i++) {
    result.push(blocks[i])
    if (i === pos30 || i === pos65) result.push(cta)
  }
  return result.join('')
}

export default function BlogContent({ content, slug }: BlogContentProps) {
  const sanitized = typeof window !== 'undefined'
    ? DOMPurify.sanitize(content, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target'],
      })
    : content

  return (
    <div
      className="blog-content prose prose-invert prose-lg max-w-none"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: injectCTAs(sanitized) }}
    />
  )
}
