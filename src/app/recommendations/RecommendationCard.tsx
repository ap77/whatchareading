'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { dismissRecommendation } from '@/app/actions/recommendations'
import type { BreakdownItem } from '@/lib/database.types'

interface Props {
  id: string
  title: string
  author: string | null
  published_year: number | null
  cover_url: string | null
  explanation: string
  breakdown: BreakdownItem[] | null
}

export default function RecommendationCard({ id, title, author, published_year, cover_url, explanation, breakdown }: Props) {
  const router = useRouter()
  const [dismissing, setDismissing] = useState<'already_read' | 'not_for_me' | null>(null)
  const [expanded, setExpanded] = useState(false)

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
    <div className="rounded-xl border border-stone-200 bg-white p-5 animate-fade-in">
      <div className="flex gap-4 mb-4">
        {cover_url ? (
          <img
            src={cover_url}
            alt=""
            className="w-14 rounded object-cover flex-shrink-0 shadow-sm"
            style={{ height: '84px' }}
          />
        ) : (
          <div className="w-14 rounded bg-stone-100 flex-shrink-0" style={{ height: '84px' }} />
        )}
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="font-semibold text-stone-900 leading-snug">{title}</h3>
          <p className="text-sm text-stone-500 mt-0.5">
            {author}
            {published_year ? ` · ${published_year}` : ''}
          </p>
        </div>
      </div>

      <p className="text-sm text-stone-700 leading-relaxed mb-4">{explanation}</p>

      {breakdown && breakdown.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
          >
            {expanded ? 'Hide details ↑' : 'Why this fits you ↓'}
          </button>

          {expanded && (
            <div className="mt-3 flex flex-col gap-2.5 animate-fade-up">
              {breakdown.map((item, i) => (
                <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                  <p className="text-xs font-semibold text-stone-500 mb-1">
                    Because you loved <span className="text-stone-800">{item.book}</span>
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.connection}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => handleDismiss('already_read')}
          disabled={dismissing !== null}
          className="rounded-full border border-stone-200 px-3 py-1.5 text-xs text-stone-400 hover:border-stone-400 hover:text-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {dismissing === 'already_read' ? 'Noting…' : 'Already read'}
        </button>
        <button
          onClick={() => handleDismiss('not_for_me')}
          disabled={dismissing !== null}
          className="rounded-full border border-stone-200 px-3 py-1.5 text-xs text-stone-400 hover:border-stone-400 hover:text-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {dismissing === 'not_for_me' ? 'Noted…' : 'Not for me'}
        </button>
      </div>
    </div>
  )
}
