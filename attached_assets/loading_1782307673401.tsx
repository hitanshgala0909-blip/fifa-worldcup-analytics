import { SkeletonTable } from '@/components/ui/primitives'

export default function FantasyLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="page-header space-y-2">
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton h-10 w-52 rounded" />
        <div className="skeleton h-4 w-[460px] max-w-full rounded" />
      </div>

      {/* Tab cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-8 mt-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card p-3 space-y-2">
            <div className="skeleton h-4 w-4 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-3 w-full rounded hidden sm:block" />
            <div className="skeleton h-3 w-3/4 rounded hidden sm:block" />
          </div>
        ))}
      </div>

      {/* Active section */}
      <div className="flex items-center gap-3 mb-5">
        <div className="skeleton h-5 w-5 rounded" />
        <div>
          <div className="skeleton h-7 w-40 rounded mb-1" />
          <div className="skeleton h-3 w-52 rounded" />
        </div>
      </div>

      {/* Top 3 highlight cards */}
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="card overflow-hidden">
        <SkeletonTable rows={12} cols={7} />
      </div>
    </div>
  )
}
