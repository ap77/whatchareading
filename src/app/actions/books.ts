'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CLAUDE_MODEL } from '@/lib/config'
import type { DnaAttribute } from '@/lib/database.types'

const anthropic = new Anthropic()

const SYSTEM_PROMPT =
  `You are a literary insight generator for an app called Whatchareading. Given a book, you produce a 'DNA' — a list of attributes that capture what makes the book distinctive and what a reader might respond to. The tone is conversational and a little playful, like a well-read friend pointing out interesting things, not academic or clinical. You will return strictly valid JSON matching the schema provided. No prose outside the JSON.`

function buildDnaPrompt(
  title: string,
  author: string | null,
  publishedYear: number | null,
  chips: string[],
  freeText: string | null,
): string {
  const yearClause = publishedYear ? ` (published ${publishedYear})` : ''

  let userContextClause = ''
  if (chips.length > 0 || freeText) {
    const chipsPart = chips.length > 0
      ? `The user picked these chips for why they liked it: ${chips.join(', ')}.`
      : ''
    const freePart = freeText ? ` They also noted: "${freeText}"` : ''
    userContextClause = `\n${chipsPart}${freePart}\n\nLet this user context subtly influence which attributes you surface, but don't pander to it.\n`
  }

  return `Book: "${title}" by ${author ?? 'Unknown'}${yearClause}
${userContextClause}
Generate 10 DNA attributes for this book, distributed roughly as:
- 3 from 'recognizable' surprise level (things most readers would recognize: genre, setting, broad style)
- 4 from 'subtle' surprise level (things a thoughtful reader might notice: narrative technique, voice quirks, structural choices)
- 3 from 'surprising' surprise level (genuinely unexpected observations: unusual patterns, oddball insights, things even fans of the book might not have articulated)

Distribute across these 5 categories (at least 1 from each):
- form: structure, length, pacing, format
- voice: narration, tone, register, prose style
- content: subject, setting, themes, time period
- experience: emotional register, cognitive demand, what reading it feels like
- quirk: oddball or surprising observations that don't fit elsewhere

Each attribute is an object:
{
  "category": "form" | "voice" | "content" | "experience" | "quirk",
  "label": "short label, 2-6 words, sentence case",
  "explanation": "one sentence, conversational, that explains the attribute and why it might matter",
  "surprise_level": "recognizable" | "subtle" | "surprising"
}

The 'surprising' attributes should genuinely surprise. Avoid clichés. If you can't think of something genuinely surprising, mark it 'subtle' instead — never inflate the surprise level.

Output strict JSON: {"attributes": [ ... 10 attributes ... ]}`
}

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (match) return match[1]
  return text.trim()
}

async function callClaude(prompt: string): Promise<DnaAttribute[]> {
  const attempt = async () => {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
    const json = extractJSON(block.text)
    const parsed = JSON.parse(json) as { attributes: DnaAttribute[] }
    if (!Array.isArray(parsed.attributes) || parsed.attributes.length === 0) {
      throw new Error('Invalid DNA response shape')
    }
    return parsed.attributes
  }

  try {
    return await attempt()
  } catch {
    // One retry on parse failure
    return await attempt()
  }
}

export interface SaveBookInput {
  openlibrary_key: string | null
  title: string
  author: string | null
  published_year: number | null
  cover_url: string | null
  chips: string[]
  free_text: string | null
}

export async function saveBook(
  input: SaveBookInput,
): Promise<{ error: string } | { userBookId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Upsert book — deduplicate by openlibrary_key when available
  let bookId: string

  if (input.openlibrary_key) {
    const { data: existingBook } = await supabase
      .from('books')
      .select('id')
      .eq('openlibrary_key', input.openlibrary_key)
      .maybeSingle()

    if (existingBook) {
      bookId = existingBook.id
    } else {
      const { data: newBook, error: insertErr } = await supabase
        .from('books')
        .insert({
          openlibrary_key: input.openlibrary_key,
          title: input.title,
          author: input.author,
          published_year: input.published_year,
          cover_url: input.cover_url,
        })
        .select('id')
        .single()
      if (insertErr || !newBook) return { error: 'Failed to save book' }
      bookId = newBook.id
    }
  } else {
    // Manual entry — no deduplication, always insert
    const { data: newBook, error: insertErr } = await supabase
      .from('books')
      .insert({
        title: input.title,
        author: input.author,
        published_year: input.published_year,
        cover_url: null,
      })
      .select('id')
      .single()
    if (insertErr || !newBook) return { error: 'Failed to save book' }
    bookId = newBook.id
  }

  // 2. If user already added this book, return the existing entry
  const { data: existingUserBook } = await supabase
    .from('user_books')
    .select('id')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .maybeSingle()
  if (existingUserBook) return { userBookId: existingUserBook.id }

  // 3. Get or generate DNA (cached per book, not per user)
  const { data: existingDna } = await supabase
    .from('book_dna')
    .select('id')
    .eq('book_id', bookId)
    .maybeSingle()

  if (!existingDna) {
    const prompt = buildDnaPrompt(
      input.title,
      input.author,
      input.published_year,
      input.chips,
      input.free_text,
    )

    let attributes: DnaAttribute[]
    try {
      attributes = await callClaude(prompt)
    } catch {
      return { error: "We couldn't analyze this book right now. Please try again." }
    }

    const admin = createAdminClient()
    const { error: dnaErr } = await admin
      .from('book_dna')
      .insert({ book_id: bookId, attributes, model_used: CLAUDE_MODEL })
    if (dnaErr) return { error: 'Failed to save DNA analysis' }
  }

  // 4. Create user_books row
  const { data: userBook, error: userBookErr } = await supabase
    .from('user_books')
    .insert({
      user_id: user.id,
      book_id: bookId,
      chips: input.chips.length > 0 ? input.chips : null,
      free_text: input.free_text,
    })
    .select('id')
    .single()

  if (userBookErr || !userBook) return { error: 'Failed to save your book entry' }
  return { userBookId: userBook.id }
}
