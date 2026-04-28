'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    // Always show success — don't reveal whether the email is registered
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-stone-900">Check your email</h1>
        <p className="mt-3 max-w-sm text-stone-500 text-sm leading-relaxed">
          The link&apos;s on its way to <strong>{email}</strong>. It may take a minute to arrive.
        </p>
        <Link
          href="/login"
          className="mt-8 text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          Back to sign in
        </Link>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-stone-900">Forgot your password?</h1>
        <p className="mt-2 text-stone-500 text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          <Link href="/login" className="font-medium text-stone-900 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
