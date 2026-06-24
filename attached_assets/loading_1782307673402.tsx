// app/loading.tsx
// Root-level loading UI — shown during RSC data fetching on any page.
// Each page can also provide its own loading.tsx to scope the skeleton.

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      {/* Animated stadium-lights spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-pitch-600" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent
                        border-t-gold animate-spin" />
      </div>
      <p className="text-ink-muted text-sm animate-pulse">Loading…</p>
    </div>
  )
}
