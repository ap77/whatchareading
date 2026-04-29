import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import OnboardingCards from './OnboardingCards'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_dismissed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  const showOnboarding = !profile?.onboarding_dismissed_at

  const { data: userBooks } = await supabase
    .from('user_books')
    .select(`
      id,
      books (
        title, author, cover_url,
        book_dna ( id )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const books = userBooks ?? []

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      {showOnboarding && <OnboardingCards />}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-stone-900">Your books</h1>
        <Link
          href="/books/new"
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
        >
          + Add a book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-24">
          <div className="flex gap-1 justify-center items-end mb-8">
            {[64, 80, 56, 96, 72].map((h, i) => (
              <div key={i} className="w-5 rounded-sm bg-stone-200" style={{ height: `${h}px` }} />
            ))}
          </div>
          <p className="text-stone-600 mb-1 font-medium">No books yet.</p>
          <p className="text-stone-400 text-sm mb-8">Tell us about one you&apos;ve loved.</p>
          <Link
            href="/books/new"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
          >
            Add your first book
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            {books.map(ub => {
              const book = ub.books as {
                title: string
                author: string | null
                cover_url: string | null
                book_dna: { id: string } | { id: string }[] | null
              }
              const hasDna = Array.isArray(book.book_dna)
                ? book.book_dna.length > 0
                : book.book_dna !== null

              return (
                <Link
                  key={ub.id}
                  href={`/books/${ub.id}`}
                  className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-3.5 hover:border-stone-300 hover:shadow-sm active:scale-[0.995] transition-all"
                >
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt=""
                      className="w-11 rounded flex-shrink-0 object-cover shadow-sm"
                      style={{ height: '64px' }}
                    />
                  ) : (
                    <div className="w-11 bg-stone-100 rounded flex-shrink-0" style={{ height: '64px' }} />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{book.title}</p>
                    {book.author && (
                      <p className="text-sm text-stone-500 mt-0.5 truncate">{book.author}</p>
                    )}
                    {hasDna && (
                      <p className="text-xs text-amber-700 mt-1">DNA analyzed</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-10">
            <Link
              href="/recommendations"
              className="flex items-center justify-between w-full rounded-xl border border-stone-200 bg-white px-5 py-4 hover:border-amber-400 hover:bg-amber-50 hover:shadow-sm active:scale-[0.995] transition-all group"
            >
              <div>
                <p className="font-semibold text-stone-900 text-sm">What should I read next?</p>
                <p className="text-xs text-stone-400 mt-0.5">Personalized picks based on your taste</p>
              </div>
              <span className="text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all text-lg">→</span>
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
