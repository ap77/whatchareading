'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionStatus(session ? 'valid' : 'invalid')
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  if (sessionStatus === 'loading') {
    return (
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
        <p className="text-stone-400 text-sm">Checking your link…</p>
      </main>
    )
  }

  if (sessionStatus === 'invalid') {
    return (
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-stone-900">Link expired</h1>
        <p className="mt-3 max-w-sm text-stone-500 text-sm leading-relaxed">
          This password reset link has expired or is invalid. Request a new one and try again.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
        >
          Request a new link
        </Link>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-stone-900">Set a new password</h1>
        <p className="mt-2 text-stone-500 text-sm">Must be at least 8 characters.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-stone-700 mb-1">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </main>
  )
}
