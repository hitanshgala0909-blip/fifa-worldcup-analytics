'use client'
// app/error.tsx
// Next.js 15 error boundary — catches RSC and client render errors.
// Must be a Client Component.

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorProps {
  error:  Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('[GlobalError]', error)
    }
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-loss/10 border border-loss/20
                      flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-loss" />
      </div>

      <div>
        <h2 className="font-display font-bold text-xl text-ink-primary mb-2">
          Something went wrong
        </h2>
        <p className="text-ink-muted text-sm max-w-sm leading-relaxed">
          {error.message?.includes('fetch')
            ? 'Could not connect to the prediction API. Make sure the backend is running.'
            : 'An unexpected error occurred. Try refreshing the page.'
          }
        </p>
        {error.digest && (
          <p className="text-ink-ghost text-xs mt-2 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-card
                   bg-pitch-700 border border-pitch-600 text-ink-secondary text-sm font-medium
                   hover:text-ink-primary hover:border-pitch-500 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Try again
      </button>
    </div>
  )
}
