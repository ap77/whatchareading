import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { BreakdownItem } from '@/lib/database.types'
import QuestionFlow from './QuestionFlow'
import StalenessBanner from './StalenessBanner'
import SwipeUI from './SwipeUI'
import type { SwipeRec } from './SwipeUI'

interface RecRow {
  id: string
  explanation: string
  breakdown: BreakdownItem[] | null
  books: {
    title: string
    author: string | null
    published_year: number | null
    cover_url: string | null
  } | null
}

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Gate: user must have at least one book
  const { count: bookCount } = await supabase
    .from('user_books')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (!bookCount || bookCount === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-stone-900 mb-3">What to read next</h1>
        <p className="text-stone-500 mb-6">
          Add some books you&apos;ve loved first — then we&apos;ll find your next one.
        </p>
        <Link
          href="/books/new"
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
        >
          Add a book
        </Link>
      </main>
    )
  }

  // Find the latest batch
  const { data: latestBatch } = await supabase
    .from('recommendations')
    .select('batch_id')
    .eq('user_id', user.id)
    .not('batch_id', 'is', null)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch pending recs from that batch (not dismissed, feedback null)
  let batchRecs: RecRow[] = []
  if (latestBatch?.batch_id) {
    const { data: recs } = await supabase
      .from('recommendations')
      .select(`
        id, explanation, breakdown,
        books ( title, author, published_year, cover_url )
      `)
      .eq('user_id', user.id)
      .eq('batch_id', latestBatch.batch_id)
      .is('feedback', null)
      .order('generated_at', { ascending: true })

    batchRecs = (recs ?? []) as RecRow[]
  }

  // Exclude recs already saved to satchel — user has already acted on those
  let pendingRecs: RecRow[] = batchRecs
  if (batchRecs.length > 0) {
    const { data: satchelItems } = await supabase
      .from('satchel_items')
      .select('recommendation_id')
      .eq('user_id', user.id)

    if (satchelItems && satchelItems.length > 0) {
      const satcheledIds = new Set(satchelItems.map(s => s.recommendation_id))
      pendingRecs = batchRecs.filter(r => !satcheledIds.has(r.id))
    }
  }

  // Staleness flag
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('recommendations_stale')
    .eq('user_id', user.id)
    .maybeSingle()

  const isStale = profile?.recommendations_stale ?? false

  const hasPendingRecs = pendingRecs.length > 0

  const swipeRecs: SwipeRec[] = pendingRecs.map(r => ({
    id: r.id,
    title: r.books?.title ?? 'Unknown',
    author: r.books?.author ?? null,
    published_year: r.books?.published_year ?? null,
    cover_url: r.books?.cover_url ?? null,
    explanation: r.explanation,
    breakdown: r.breakdown ?? null,
  }))

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-xl font-bold text-stone-900 mb-8">What to read next</h1>

      {hasPendingRecs ? (
        <>
          <StalenessBanner isStale={isStale} />
          <SwipeUI recs={swipeRecs} />
        </>
      ) : latestBatch ? (
        // Scenario 2: existing user, all recs processed — go add more signal, no QuestionFlow
        <div className="mt-4">
          <p className="text-stone-500 mb-6">
            We&apos;re out of new recommendations right now. Try adding more books you&apos;ve loved — we&apos;ll find fresher options.
          </p>
          <Link
            href="/books/new"
            className="inline-block rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
          >
            Add a book
          </Link>
        </div>
      ) : (
        // Scenario 1: first-time user with books but no recs yet — go straight to QuestionFlow
        <div className="mt-8 py-12">
          <QuestionFlow />
        </div>
      )}

      <div className="mt-12">
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
          ← Back to your books
        </Link>
      </div>
    </main>
  )
}
