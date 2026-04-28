'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { CLAUDE_MODEL } from '@/lib/config'
import type { DnaAttribute } from '@/lib/database.types'

const anthropic = new Anthropic()

const SYSTEM_PROMPT =
  `You are a book recommendation engine for Whatchareading. Based on a reader's book history and DNA analysis, you suggest books they'll genuinely love. Recommendations are specific and grounded — you reference exact attributes from their reading history, not generic observations. You think like a well-read friend who has noticed patterns in someone's taste that they might not have consciously articulated. You will return strictly valid JSON. No prose outside the JSON.`

interface BookContext {
  title: string
  author: string | null
  published_year: number | null
  chips: string[] | null
  free_text: string | null
  attributes: DnaAttribute[]
}

function buildPrompt(books: BookContext[], excludeTitles: string[]): string {
  const booksSection = books.map(b => {
    const yearStr = b.published_year ? ` (${b.published_year})` : ''
    const lines: string[] = [`**"${b.title}" by ${b.author ?? 'Unknown'}${yearStr}**`]
    if (b.chips?.length) lines.push(`Loved: ${b.chips.join(', ')}`)
    if (b.free_text) lines.push(`Note: "${b.free_text}"`)
    lines.push('DNA:')
    b.attributes.forEach(a => {
      const marker = a.surprise_level === 'surprising' ? ' ✨' : ''
      lines.push(`• ${a.label} (${a.category}, ${a.surprise_level}${marker}): ${a.explanation}`)
    })
    return lines.join('\n')
  }).join('\n\n---\n\n')

  const excludeSection = excludeTitles.length > 0
    ? `\nThey have already seen these recommendations and dismissed them — do not suggest them:\n${excludeTitles.map(t => `- "${t}"`).join('\n')}\n`
    : ''

  return `Here are the books this reader has loved, with DNA analysis:

${booksSection}
${excludeSection}
Recommend 6 books this reader would love. Requirements:
- Real, published books only
- Do not recommend any books already in their list above
- Vary across genre, style, and era — don't cluster recommendations
- For each: write 1-2 sentences explaining why this specific reader would love it, referencing at least one of their books by name and connecting specific DNA attributes to the recommendation

Return strict JSON:
{"recommendations": [{"title": "...", "author": "...", "published_year": 1985, "explanation": "..."}, ...]}`
}

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (match) return match[1]
  return text.trim()
}

interface RawRecommendation {
  title: string
  author: string
  published_year: number | null
  explanation: string
}

async function callClaude(prompt: string): Promise<RawRecommendation[]> {
  const attempt = async () => {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type')
    const parsed = JSON.parse(extractJSON(block.text)) as { recommendations: RawRecommendation[] }
    if (!Array.isArray(parsed.recommendations) || parsed.recommendations.length === 0) {
      throw new Error('Invalid recommendations shape')
    }
    return parsed.recommendations
  }

  try {
    return await attempt()
  } catch {
    return await attempt()
  }
}

export async function generateRecommendations(): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Fetch all user's books with DNA
  const { data: userBooks } = await supabase
    .from('user_books')
    .select(`
      id, chips, free_text,
      books (
        title, author, published_year,
        book_dna ( attributes )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!userBooks || userBooks.length === 0) {
    return { error: 'Add some books first before generating recommendations.' }
  }

  const userBookIds = userBooks.map(ub => ub.id)

  // Build book context list (only include books that have DNA)
  const bookContexts: BookContext[] = []
  const userBookTitles: string[] = []

  for (const ub of userBooks) {
    const book = ub.books as {
      title: string
      author: string | null
      published_year: number | null
      book_dna: { attributes: DnaAttribute[] } | { attributes: DnaAttribute[] }[] | null
    } | null
    if (!book) continue

    userBookTitles.push(book.title)
    const dna = Array.isArray(book.book_dna) ? book.book_dna[0] : book.book_dna
    const attributes = dna?.attributes ?? []

    bookContexts.push({
      title: book.title,
      author: book.author,
      published_year: book.published_year,
      chips: ub.chips,
      free_text: ub.free_text,
      attributes,
    })
  }

  // 2. Fetch previously dismissed recommendation titles (to exclude)
  const { data: dismissed } = await supabase
    .from('recommendations')
    .select(`books ( title )`)
    .eq('user_id', user.id)
    .not('feedback', 'is', null)

  const dismissedTitles: string[] = []
  if (dismissed) {
    for (const d of dismissed) {
      const b = d.books as { title: string } | null
      if (b?.title) dismissedTitles.push(b.title)
    }
  }

  const excludeTitles = [...new Set([...userBookTitles, ...dismissedTitles])]

  // 3. Call Claude
  const prompt = buildPrompt(bookContexts, excludeTitles)
  let rawRecs: RawRecommendation[]
  try {
    rawRecs = await callClaude(prompt)
  } catch {
    return { error: "We couldn't generate recommendations right now. Please try again." }
  }

  // 4. Create book rows and insert recommendations
  const batchId = crypto.randomUUID()
  let inserted = 0

  for (const rec of rawRecs.slice(0, 6)) {
    const { data: bookRow, error: bookErr } = await supabase
      .from('books')
      .insert({
        title: rec.title,
        author: rec.author ?? null,
        published_year: rec.published_year ?? null,
      })
      .select('id')
      .single()

    if (bookErr || !bookRow) {
      console.error('[generateRecommendations] book insert error:', bookErr)
      continue
    }

    const { error: recErr } = await supabase.from('recommendations').insert({
      user_id: user.id,
      recommended_book_id: bookRow.id,
      explanation: rec.explanation,
      based_on_book_ids: userBookIds,
      batch_id: batchId,
    })

    if (recErr) {
      console.error('[generateRecommendations] recommendation insert error:', recErr)
    } else {
      inserted++
    }
  }

  if (inserted === 0) {
    return { error: 'Failed to save recommendations — check server logs.' }
  }

  return { success: true }
}

export async function dismissRecommendation(
  id: string,
  feedback: 'already_read' | 'not_for_me',
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('recommendations')
    .update({ feedback, feedback_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to dismiss recommendation' }
  return { success: true }
}
