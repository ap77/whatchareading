'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { saveBook } from '@/app/actions/books'

interface OLSearchResult {
  key: string
  title: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number
}

const CHIPS = [
  'the writing',
  'the characters',
  'the story',
  'the ideas',
  'the pacing',
  'the world / setting',
  'the emotional impact',
  'the voice',
  'I learned something',
  'it made me laugh',
  'it made me cry',
  'it was weird in a good way',
  'I read it in one sitting',
  'I kept thinking about it after',
  'the vibes',
]

export default function BookEntryForm() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OLSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedBook, setSelectedBook] = useState<OLSearchResult | null>(null)
  const [chips, setChips] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const search = useCallback(async (q: string) => {
    setIsSearching(true)
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8&fields=key,title,author_name,first_publish_year,cover_i`
      const res = await fetch(url)
      const data = await res.json() as { docs: OLSearchResult[] }
      setResults(data.docs)
      setShowDropdown(data.docs.length > 0)
    } catch {
      setResults([])
      setShowDropdown(false)
    } finally {
      setIsSearching(false)
    }
  }, [])

  function handleQueryChange(value: string) {
    setQuery(value)
    clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(() => search(value), 300)
  }

  function handleSelect(book: OLSearchResult) {
    setSelectedBook(book)
    setShowDropdown(false)
    setQuery('')
    setError(null)
  }

  function toggleChip(chip: string) {
    setChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedBook) return
    setIsSaving(true)
    setError(null)

    const coverUrl = selectedBook.cover_i
      ? `https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-M.jpg`
      : null

    const result = await saveBook({
      openlibrary_key: selectedBook.key,
      title: selectedBook.title,
      author: selectedBook.author_name?.[0] ?? null,
      published_year: selectedBook.first_publish_year ?? null,
      cover_url: coverUrl,
      chips,
      free_text: freeText.trim() || null,
    })

    if ('error' in result) {
      setError(result.error)
      setIsSaving(false)
      return
    }

    router.push(`/books/${result.userBookId}`)
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-stone-900 mb-8">Add a book</h1>

      <form onSubmit={handleSubmit}>
        {/* Search field */}
        {!selectedBook && (
          <div className="relative mb-8" ref={dropdownRef}>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Search for a book
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder="Start typing a title or author…"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
                autoFocus
              />
              {isSearching && (
                <span className="absolute right-3 top-3 text-stone-400 text-xs">
                  Searching…
                </span>
              )}
            </div>

            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lg overflow-hidden">
                {results.map(book => (
                  <button
                    key={book.key}
                    type="button"
                    onClick={() => handleSelect(book)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-amber-50 transition-colors border-b border-stone-100 last:border-0"
                  >
                    {book.cover_i ? (
                      <img
                        src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
                        alt=""
                        className="w-8 h-12 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-12 bg-stone-100 rounded flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{book.title}</p>
                      <p className="text-xs text-stone-500 truncate">
                        {book.author_name?.[0]}
                        {book.first_publish_year ? ` · ${book.first_publish_year}` : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected book summary */}
        {selectedBook && (
          <div className="flex items-start gap-4 mb-8 p-4 bg-white rounded-xl border border-stone-200">
            {selectedBook.cover_i ? (
              <img
                src={`https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-M.jpg`}
                alt=""
                className="w-16 object-cover rounded flex-shrink-0"
                style={{ height: '96px' }}
              />
            ) : (
              <div className="w-16 bg-stone-100 rounded flex-shrink-0" style={{ height: '96px' }} />
            )}
            <div className="flex-1 min-w-0 pt-1">
              <p className="font-semibold text-stone-900 leading-snug">{selectedBook.title}</p>
              <p className="text-sm text-stone-500 mt-0.5">
                {selectedBook.author_name?.[0]}
                {selectedBook.first_publish_year ? ` · ${selectedBook.first_publish_year}` : ''}
              </p>
              <button
                type="button"
                onClick={() => { setSelectedBook(null); setChips([]); setFreeText('') }}
                className="mt-2 text-xs text-stone-400 hover:text-stone-600 underline"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* Chips */}
        {selectedBook && (
          <div className="mb-6">
            <p className="text-sm font-medium text-stone-700 mb-3">
              What did you love about it?{' '}
              <span className="font-normal text-stone-400">Pick any that apply.</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {CHIPS.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleChip(chip)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    chips.includes(chip)
                      ? 'bg-stone-900 text-amber-50'
                      : 'bg-white border border-stone-300 text-stone-600 hover:border-stone-500'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Free text */}
        {selectedBook && (
          <div className="mb-8">
            <textarea
              value={freeText}
              onChange={e => setFreeText(e.target.value)}
              placeholder="anything else? what made it stick?"
              rows={3}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
            />
          </div>
        )}

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {selectedBook && (
          <>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-amber-50/30 border-t-amber-50 rounded-full animate-spin" />
                  Analyzing your book…
                </span>
              ) : (
                'Save and analyze'
              )}
            </button>
            {isSaving && (
              <p className="mt-3 text-center text-xs text-stone-400">
                This takes 10–20 seconds — we&apos;re reading between the lines.
              </p>
            )}
          </>
        )}
      </form>
    </main>
  )
}
