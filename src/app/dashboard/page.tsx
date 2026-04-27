import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Your books</h1>
        <Link
          href="/books/new"
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
        >
          + Add a book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-600 mb-1">You haven&apos;t added any books yet.</p>
          <p className="text-stone-400 text-sm mb-8">Tell us about one you&apos;ve loved.</p>
          <Link
            href="/books/new"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
          >
            Add your first book
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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
                className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:border-stone-300 hover:shadow-sm transition-all"
              >
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt=""
                    className="w-12 object-cover rounded flex-shrink-0"
                    style={{ height: '72px' }}
                  />
                ) : (
                  <div className="w-12 bg-stone-100 rounded flex-shrink-0" style={{ height: '72px' }} />
                )}
                <div>
                  <p className="font-semibold text-stone-900">{book.title}</p>
                  {book.author && (
                    <p className="text-sm text-stone-500 mt-0.5">{book.author}</p>
                  )}
                  {hasDna && (
                    <p className="text-xs text-stone-400 mt-1">10 traits identified</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
