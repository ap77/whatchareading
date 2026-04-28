'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { dismissRecommendation } from '@/app/actions/recommendations'

interface Props {
  id: string
  title: string
  author: string | null
  published_year: number | null
  explanation: string
}

export default function RecommendationCard({ id, title, author, published_year, explanation }: Props) {
  const router = useRouter()
  const [dismissing, setDismissing] = useState<'already_read' | 'not_for_me' | null>(null)

  async function handleDismiss(feedback: 'already_read' | 'not_for_me') {
    setDismissing(feedback)
    const result = await dismissRecommendation(id, feedback)
    if ('error' in result) {
      setDismissing(null)
      return
    }
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="mb-3">
        <h3 className="font-semibold text-stone-900 leading-snug">{title}</h3>
        <p className="text-sm text-stone-500 mt-0.5">
          {author}
          {published_year ? ` · ${published_year}` : ''}
        </p>
      </div>

      <p className="text-sm text-stone-700 leading-relaxed mb-5">{explanation}</p>

      <div className="flex gap-2">
        <button
          onClick={() => handleDismiss('already_read')}
          disabled={dismissing !== null}
          className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {dismissing === 'already_read' ? 'Noting…' : 'Already read'}
        </button>
        <button
          onClick={() => handleDismiss('not_for_me')}
          disabled={dismissing !== null}
          className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {dismissing === 'not_for_me' ? 'Noted…' : 'Not for me'}
        </button>
      </div>
    </div>
  )
}
