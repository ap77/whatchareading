// TODO: RecommendationCard.tsx is no longer rendered anywhere — safe to delete once Feature 2 is confirmed stable.
'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { saveToSatchel } from '@/app/actions/satchel'
import { skipRecommendation } from '@/app/actions/recommendations'
import QuestionFlow from './QuestionFlow'
import type { BreakdownItem } from '@/lib/database.types'

export interface SwipeRec {
  id: string
  title: string
  author: string | null
  published_year: number | null
  cover_url: string | null
  explanation: string
  breakdown: BreakdownItem[] | null
}

type Phase = 'swiping' | 'done' | 'generating'

export default function SwipeUI({ recs }: { recs: SwipeRec[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [savePulse, setSavePulse] = useState(false)
  const [isActing, setIsActing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('swiping')
  const [expanded, setExpanded] = useState(false)

  // May be undefined when phase === 'done' (currentIndex === recs.length).
  // Only used in the 'swiping' render branch where it is always defined.
  const rec = recs[currentIndex]

  const handleSave = useCallback(async () => {
    if (isActing || phase !== 'swiping') return
    setIsActing(true)
    setActionError(null)
    setSavePulse(true)

    // Run the save action and the 600ms pulse timer in parallel so network
    // latency doesn't add to the visual delay. Pulse stays until both settle.
    const pulse = new Promise<void>(resolve => setTimeout(resolve, 600))
    let result: { error: string } | { success: true }
    try {
      ;[result] = await Promise.all([saveToSatchel(rec.id), pulse])
    } catch {
      setSavePulse(false)
      setActionError("Couldn't save that — try again")
      setIsActing(false)
      return
    }

    setSavePulse(false)

    if ('error' in result) {
      setActionError("Couldn't save that — try again")
      setIsActing(false)
      return
    }

    setSavedCount(c => c + 1)
    setExpanded(false)
    const next = currentIndex + 1
    if (next >= recs.length) setPhase('done')
    else setCurrentIndex(next)
    setIsActing(false)
  }, [isActing, phase, rec?.id, currentIndex, recs.length])

  const handleSkip = useCallback(async () => {
    if (isActing || phase !== 'swiping') return
    setIsActing(true)
    setActionError(null)

    let result: { error: string } | { success: true }
    try {
      result = await skipRecommendation(rec.id)
    } catch {
      setActionError("Couldn't skip that — try again")
      setIsActing(false)
      return
    }

    if ('error' in result) {
      setActionError("Couldn't skip that — try again")
      setIsActing(false)
      return
    }

    setSkippedCount(c => c + 1)
    setExpanded(false)
    const next = currentIndex + 1
    if (next >= recs.length) setPhase('done')
    else setCurrentIndex(next)
    setIsActing(false)
  }, [isActing, phase, rec?.id, currentIndex, recs.length])

  useEffect(() => {
    if (phase !== 'swiping') return
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase()
      if (e.key === 'ArrowDown' || key === 'j') handleSkip()
      else if (e.key === 'ArrowUp' || key === 'k') handleSave()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phase, handleSave, handleSkip])

  if (phase === 'generating') {
    return (
      <div className="py-12">
        <QuestionFlow />
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="py-16 text-center animate-fade-in">
        <p className="text-xl font-semibold text-stone-900 mb-1">
          You saved {savedCount}, skipped {skippedCount}.
        </p>
        <p className="text-sm text-stone-400 mb-10">What&apos;s next?</p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={() => setPhase('generating')}
            className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
          >
            Show me more
          </button>
          <Link
            href="/satchel"
            className="rounded-full border border-stone-200 px-6 py-3 text-sm text-stone-700 hover:border-stone-400 transition-colors text-center"
          >
            View my satchel
          </Link>
          <Link
            href="/books/new"
            className="rounded-full border border-stone-200 px-6 py-3 text-sm text-stone-700 hover:border-stone-400 transition-colors text-center"
          >
            Add another book
          </Link>
        </div>
      </div>
    )
  }

  // phase === 'swiping' — guard against recs shrinking under us (e.g. RSC re-render)
  if (currentIndex >= recs.length) {
    setPhase('done')
    return null
  }

  return (
    <div>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        {recs.length === 6
          ? "Here are your top picks. Save the ones you want to read, skip the ones you don't."
          : "Picking up where you left off — a few more for you to consider."}
      </p>

      <p className="text-xs text-stone-400 mb-4">
        Card {currentIndex + 1} of {recs.length}
      </p>

      {/* key triggers animate-fade-in on each new card */}
      <div
        key={currentIndex}
        className={`rounded-xl border bg-white p-5 animate-fade-in transition-all duration-300 ${
          savePulse
            ? 'border-emerald-400 ring-2 ring-emerald-400 ring-offset-1'
            : 'border-stone-200'
        }`}
      >
        <div className="flex gap-4 mb-4">
          {rec.cover_url ? (
            <img
              src={rec.cover_url}
              alt=""
              className="w-14 rounded object-cover flex-shrink-0 shadow-sm"
              style={{ height: '84px' }}
            />
          ) : (
            <div className="w-14 rounded bg-stone-100 flex-shrink-0" style={{ height: '84px' }} />
          )}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-semibold text-stone-900 leading-snug">{rec.title}</h3>
            <p className="text-sm text-stone-500 mt-0.5">
              {rec.author}
              {rec.published_year ? ` · ${rec.published_year}` : ''}
            </p>
          </div>
        </div>

        <p className="text-sm text-stone-700 leading-relaxed mb-4">{rec.explanation}</p>

        {rec.breakdown && rec.breakdown.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
            >
              {expanded ? 'Hide details ↑' : 'Why this fits you ↓'}
            </button>
            {expanded && (
              <div className="mt-3 flex flex-col gap-2.5 animate-fade-up">
                {rec.breakdown.map((item, i) => (
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

      {actionError && (
        <p className="text-sm text-red-600 text-center mt-4">{actionError}</p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSkip}
          disabled={isActing}
          className="flex-1 rounded-xl border border-stone-200 py-3 text-sm text-stone-400 hover:border-stone-300 hover:text-stone-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Skip
        </button>
        <button
          onClick={handleSave}
          disabled={isActing}
          className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save to satchel
        </button>
      </div>

      <p className="text-center text-xs text-stone-300 mt-4">↑ K &nbsp; save &nbsp;·&nbsp; ↓ J &nbsp; skip</p>
    </div>
  )
}
