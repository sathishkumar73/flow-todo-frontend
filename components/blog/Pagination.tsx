'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const searchParams = useSearchParams()
  if (totalPages <= 1) return null

  const pageUrl = (page: number) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set('page', page.toString())
    return `${baseUrl}?${p.toString()}`
  }

  const pages: (number | string)[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('…')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('…')
    if (!pages.includes(totalPages)) pages.push(totalPages)
  }

  const btnBase = 'px-4 py-2 rounded-lg font-medium text-sm transition-colors'
  const active = { background: '#2563EB', color: '#fff' }
  const inactive = { background: 'rgba(255,255,255,0.05)', color: 'rgba(232,232,240,0.62)', border: '1px solid rgba(255,255,255,0.07)' }
  const disabled = { ...inactive, opacity: 0.4, pointerEvents: 'none' as const }

  return (
    <nav className="flex justify-center items-center gap-2 mt-12">
      <Link href={currentPage > 1 ? pageUrl(currentPage - 1) : '#'}
        className={btnBase} style={currentPage > 1 ? inactive : disabled}>
        ← Prev
      </Link>

      <div className="hidden sm:flex items-center gap-1">
        {pages.map((p, i) => p === '…' ? (
          <span key={`e${i}`} className="px-2 text-sm" style={{ color: 'rgba(232,232,240,0.38)' }}>…</span>
        ) : (
          <Link key={p} href={pageUrl(p as number)} className={btnBase}
            style={currentPage === p ? active : inactive}>
            {p}
          </Link>
        ))}
      </div>

      <span className="sm:hidden text-sm" style={{ color: 'rgba(232,232,240,0.38)' }}>
        {currentPage} / {totalPages}
      </span>

      <Link href={currentPage < totalPages ? pageUrl(currentPage + 1) : '#'}
        className={btnBase} style={currentPage < totalPages ? inactive : disabled}>
        Next →
      </Link>
    </nav>
  )
}
