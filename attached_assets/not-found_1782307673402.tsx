// app/not-found.tsx
import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
}

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      {/* Large 404 */}
      <div>
        <p className="font-display font-extrabold text-gold/20 leading-none select-none"
           style={{ fontSize: 'clamp(6rem, 20vw, 14rem)' }}>
          404
        </p>
      </div>

      <div className="-mt-8">
        <h1 className="font-display font-bold text-2xl text-ink-primary mb-2">
          This page doesn't exist
        </h1>
        <p className="text-ink-muted text-sm max-w-sm leading-relaxed">
          The prediction you were looking for has gone wide.
          Head back home and try again.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-card
                     bg-gold text-pitch-950 text-sm font-bold
                     hover:bg-gold-light transition-colors"
        >
          <Home className="w-4 h-4" />
          Go home
        </Link>
        <Link
          href="/predictor"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-card
                     bg-pitch-700 border border-pitch-600 text-ink-secondary text-sm font-medium
                     hover:text-ink-primary transition-colors"
        >
          <Search className="w-4 h-4" />
          Predict a match
        </Link>
      </div>
    </div>
  )
}
