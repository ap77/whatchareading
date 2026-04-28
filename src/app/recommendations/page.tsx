import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import GenerateButton from './GenerateButton'
import RecommendationCard from './RecommendationCard'

interface RecRow {
  id: string
  explanation: string
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

  // How many books does the user have?
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

  // Get active (un-dismissed) recommendations from that batch
  let activeRecs: RecRow[] = []
  let remainingInBatch = 0

  if (latestBatch?.batch_id) {
    const { data: recs } = await supabase
      .from('recommendations')
      .select(`
        id, explanation,
        books ( title, author, published_year, cover_url )
      `)
      .eq('user_id', user.id)
      .eq('batch_id', latestBatch.batch_id)
      .is('feedback', null)
      .order('generated_at', { ascending: true })

    activeRecs = (recs ?? []) as RecRow[]
    remainingInBatch = activeRecs.length
  }

  const hasActiveRecs = activeRecs.length > 0
  const visibleRecs = activeRecs.slice(0, 3)

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-stone-900">What to read next</h1>
      </div>

      {!hasActiveRecs ? (
        <div className="mt-8 text-center py-12">
          <p className="text-stone-600 mb-2">
            {latestBatch
              ? "You've gone through all our picks."
              : "Ready to find your next read?"}
          </p>
          {latestBatch && (
            <p className="text-stone-400 text-sm mb-8">Want a fresh set?</p>
          )}
          {!latestBatch && (
            <p className="text-stone-400 text-sm mb-8">
              We&apos;ll look at the books you&apos;ve loved and find something that fits.
            </p>
          )}
          <GenerateButton label="Find my next read" />
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-400 mb-8">
            {remainingInBatch > 3
              ? `Showing 3 of ${remainingInBatch} picks — dismiss any to see the next one.`
              : remainingInBatch === 1
              ? '1 pick remaining.'
              : `${remainingInBatch} picks remaining.`}
          </p>

          <div className="flex flex-col gap-4">
            {visibleRecs.map(rec => (
              <RecommendationCard
                key={rec.id}
                id={rec.id}
                title={rec.books?.title ?? 'Unknown'}
                author={rec.books?.author ?? null}
                published_year={rec.books?.published_year ?? null}
                explanation={rec.explanation}
              />
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-400 mb-3">Not what you were hoping for?</p>
            <GenerateButton label="Get fresh recommendations" />
          </div>
        </>
      )}

      <div className="mt-12">
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
          ← Back to your books
        </Link>
      </div>
    </main>
  )
}
