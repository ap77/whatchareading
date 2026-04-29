'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateRecommendations } from '@/app/actions/recommendations'

export default function GenerateButton({ label, answers, onSuccess }: { label: string; answers?: Record<string, string>; onSuccess?: () => void }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setIsLoading(true)
    setError(null)
    try {
      const result = await generateRecommendations(answers)
      if ('error' in result) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      onSuccess?.()
      router.refresh()
      setIsLoading(false)
    } catch (e) {
      console.error('[GenerateButton]', e)
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-amber-50/30 border-t-amber-50 rounded-full animate-spin" />
            Finding your next read…
          </span>
        ) : (
          label
        )}
      </button>
      {isLoading && (
        <p className="text-xs text-stone-400">This takes about 30–40 seconds.</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
