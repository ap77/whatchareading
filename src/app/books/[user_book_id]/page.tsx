import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { DnaAttribute } from '@/lib/database.types'

const CATEGORY_COLORS: Record<string, string> = {
  form:       'bg-blue-100 text-blue-700',
  voice:      'bg-purple-100 text-purple-700',
  content:    'bg-green-100 text-green-700',
  experience: 'bg-pink-100 text-pink-700',
  quirk:      'bg-orange-100 text-orange-700',
}

const SURPRISE_BG: Record<string, string> = {
  recognizable: 'bg-white',
  subtle:       'bg-amber-50',
  surprising:   'bg-amber-100',
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ user_book_id: string }>
}) {
  const { user_book_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('user_books')
    .select(`
      id, chips, free_text,
      books (
        title, author, published_year, cover_url,
        book_dna ( attributes )
      )
    `)
    .eq('id', user_book_id)
    .eq('user_id', user.id)
    .single()

  if (!data || !data.books) notFound()

  // Supabase may return book_dna as object or single-item array depending on the join cardinality hint
  const bookDna = Array.isArray(data.books.book_dna)
    ? data.books.book_dna[0]
    : data.books.book_dna
  const attributes: DnaAttribute[] = (bookDna as { attributes: DnaAttribute[] } | null)?.attributes ?? []

  const book = data.books as {
    title: string
    author: string | null
    published_year: number | null
    cover_url: string | null
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      {/* Book header */}
      <div className="flex gap-6 mb-10">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-[100px] object-cover rounded-lg flex-shrink-0 shadow-sm"
            style={{ height: '150px' }}
          />
        ) : (
          <div className="w-[100px] bg-stone-200 rounded-lg flex-shrink-0" style={{ height: '150px' }} />
        )}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-stone-900 leading-snug">{book.title}</h1>
          {book.author && <p className="mt-1 text-stone-500">{book.author}</p>}
          {book.published_year && (
            <p className="mt-0.5 text-sm text-stone-400">{book.published_year}</p>
          )}
        </div>
      </div>

      {/* Chips the user selected */}
      {data.chips && data.chips.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">You loved</p>
          <div className="flex flex-wrap gap-1.5">
            {data.chips.map(chip => (
              <span
                key={chip}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Free-text note */}
      {data.free_text && (
        <p className="mb-8 text-sm text-stone-500 italic border-l-2 border-stone-200 pl-3 leading-relaxed">
          {data.free_text}
        </p>
      )}

      {/* DNA */}
      {attributes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-stone-900 mb-1">What makes it tick</h2>
          <p className="text-sm text-stone-400 mb-6">{attributes.length} traits identified</p>
          <div className="flex flex-col gap-3">
            {attributes.map((attr, i) => (
              <div
                key={i}
                className={`rounded-xl px-4 py-3 border border-stone-200 ${SURPRISE_BG[attr.surprise_level] ?? 'bg-white'}`}
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-stone-900 text-sm">
                    {attr.surprise_level === 'surprising' && '✨ '}
                    {attr.label}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[attr.category] ?? 'bg-stone-100 text-stone-600'}`}
                  >
                    {attr.category}
                  </span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">{attr.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12">
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
          ← Back to your books
        </Link>
      </div>
    </main>
  )
}
