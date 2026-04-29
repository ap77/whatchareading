'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { removeFromSatchel } from '@/app/actions/satchel'
import type { BreakdownItem } from '@/lib/database.types'

interface Props {
  satchelItemId: string
  title: string
  author: string | null
  published_year: number | null
  cover_url: string | null
  explanation: string
  breakdown: BreakdownItem[] | null
  // TODO: add "Mark as read" action here when promoting satchel → entered book is built
}

export default function SatchelCard({
  satchelItemId,
  title,
  author,
  published_year,
  cover_url,
  explanation,
  breakdown,
}: Props) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function handleRemove() {
    setRemoving(true)
    const result = await removeFromSatchel(satchelItemId)
    if ('error' in result) {
      setRemoving(false)
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
        <button
          onClick={handleRemove}
          disabled={removing}
          aria-label="Remove from satchel"
          className="self-start mt-0.5 text-stone-300 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-stone-700 leading-relaxed mb-4">{explanation}</p>

      {breakdown && breakdown.length > 0 && (
        <div>
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
    </div>
  )
}
