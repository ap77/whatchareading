import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { BreakdownItem } from '@/lib/database.types'
import SatchelCard from './SatchelCard'

interface SatchelRow {
  id: string
  recommendations: {
    id: string
    explanation: string
    breakdown: BreakdownItem[] | null
    books: {
      title: string
      author: string | null
      published_year: number | null
      cover_url: string | null
    } | null
  } | null
}

export default async function SatchelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('satchel_items')
    .select(`
      id,
      recommendations (
        id, explanation, breakdown,
        books ( title, author, published_year, cover_url )
      )
    `)
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  const satchelItems = (items ?? []) as SatchelRow[]

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-xl font-bold text-stone-900 mb-2">My Satchel</h1>
      <p className="text-sm text-stone-400 mb-8">Books saved to read later.</p>

      {satchelItems.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-stone-500 mb-1">Your satchel is empty.</p>
          <p className="text-sm text-stone-400 mb-6">
            Save books from your recommendations to read them later.
          </p>
          <Link
            href="/recommendations"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
          >
            Browse recommendations
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {satchelItems.map(item => {
            const rec = item.recommendations
            if (!rec) return null
            return (
              <SatchelCard
                key={item.id}
                satchelItemId={item.id}
                title={rec.books?.title ?? 'Unknown'}
                author={rec.books?.author ?? null}
                published_year={rec.books?.published_year ?? null}
                cover_url={rec.books?.cover_url ?? null}
                explanation={rec.explanation}
                breakdown={rec.breakdown ?? null}
              />
            )
          })}
        </div>
      )}

      <div className="mt-12">
        <Link href="/recommendations" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
          ← Back to recommendations
        </Link>
      </div>
    </main>
  )
}
