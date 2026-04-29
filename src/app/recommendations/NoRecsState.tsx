'use client'

import { useState } from 'react'
import Link from 'next/link'
import QuestionFlow from './QuestionFlow'

export default function NoRecsState() {
  const [showFlow, setShowFlow] = useState(false)

  if (showFlow) {
    return (
      <div className="mt-8 py-12">
        <QuestionFlow />
      </div>
    )
  }

  return (
    <div className="mt-4">
      <p className="text-stone-500 mb-6">
        We&apos;re out of new recommendations right now. Try adding more books you&apos;ve loved — we&apos;ll find fresher options.
      </p>
      <div className="flex flex-col items-start gap-4">
        <button
          onClick={() => setShowFlow(true)}
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
        >
          Get new recommendations
        </button>
        <Link
          href="/books/new"
          className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
        >
          Add a book instead →
        </Link>
      </div>
    </div>
  )
}
