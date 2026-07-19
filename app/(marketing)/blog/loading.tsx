function Shimmer({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: 'rgba(255,255,255,0.07)', ...style }}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ background: '#0C0C1D', borderColor: 'rgba(255,255,255,0.07)' }}>
      <Shimmer className="h-48 rounded-none rounded-t-xl" />
      <div className="p-5 space-y-3">
        <Shimmer className="h-3 w-28" />
        <Shimmer className="h-5 w-full" />
        <Shimmer className="h-5 w-4/5" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-4 w-16 mt-4" />
      </div>
    </div>
  )
}

export default function BlogLoading() {
  return (
    <div className="min-h-screen" style={{ background: '#07070F' }}>
      {/* Hero */}
      <section className="border-b py-16 text-center" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="container mx-auto px-4 max-w-3xl space-y-4">
          <div className="flex justify-center">
            <Shimmer className="h-6 w-36 rounded-full" />
          </div>
          <Shimmer className="h-12 w-3/4 mx-auto" />
          <Shimmer className="h-12 w-1/2 mx-auto" />
          <Shimmer className="h-5 w-2/3 mx-auto" />
        </div>
      </section>

      {/* Category pills */}
      <div className="border-b py-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="container mx-auto px-4 md:px-6 flex gap-2">
          {[60, 80, 90, 120, 100].map((w, i) => (
            <Shimmer key={i} className="h-8 rounded-full shrink-0" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Grid */}
      <main className="container mx-auto px-4 md:px-6 py-12 max-w-6xl">
        <Shimmer className="h-4 w-24 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </main>
    </div>
  )
}
