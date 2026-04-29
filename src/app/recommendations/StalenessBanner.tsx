'use client'

import { useState } from 'react'
import QuestionFlow from './QuestionFlow'

export default function StalenessBanner({ isStale }: { isStale: boolean }) {
  const [dismissed, setDismissed] = useState(false)
  const [showFlow, setShowFlow] = useState(false)

  if (!isStale || dismissed) return null

  if (showFlow) {
    return (
      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/60 px-6 py-8">
        <QuestionFlow />
      </div>
    )
  }

  return (
    <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/60 px-5 py-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-stone-700">
          You&apos;ve added new books since these were generated. Want fresh picks?
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="rounded-full border border-stone-200 px-3 py-1.5 text-xs text-stone-400 hover:border-stone-400 hover:text-stone-700 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={() => setShowFlow(true)}
            className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
          >
            Get new picks
          </button>
        </div>
      </div>
    </div>
  )
}
