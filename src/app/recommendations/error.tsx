'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[recommendations] error boundary caught:', error)
  }, [error])

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-stone-700 mb-6">Something went wrong loading your recommendations.</p>
      <button
        onClick={reset}
        className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
      >
        Try again
      </button>
    </main>
  )
}
