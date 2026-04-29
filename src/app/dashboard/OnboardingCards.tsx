'use client'

import { useState } from 'react'
import { Telescope, BookPlus, Compass, Bookmark } from 'lucide-react'
import { dismissOnboarding } from '@/app/actions/profile'

const CARDS = [
  {
    Icon: Telescope,
    heading: 'What this is',
    body: "A book recommender that pays attention. Tell us books you've loved and we'll show you what's in their DNA — the obvious stuff and the not-so-obvious — and use it to suggest what to read next.",
  },
  {
    Icon: BookPlus,
    heading: 'Adding books',
    body: "Search a book, pick the chips that fit why you liked it, write a note if you want. The more specific you are about what worked for you, the better the recommendations get.",
  },
  {
    Icon: Compass,
    heading: 'Recommendations',
    body: "We'll show you six picks at a time. Save the ones you want to read into your satchel. Skip the ones that aren't for you — we won't show them again. When you've gone through six, you can ask for more.",
  },
  {
    Icon: Bookmark,
    heading: 'Your satchel',
    body: "That's your \"want to read\" pile. Books you've saved live there with the original reasoning for why we suggested them. Delete anything you change your mind about.",
  },
]

export default function OnboardingCards() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  function handleDismiss() {
    setDismissed(true)
    dismissOnboarding() // optimistic — fire and forget
  }

  return (
    <section className="mb-10">
      <p className="text-sm text-stone-500 mb-4">Welcome — here&apos;s the gist.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CARDS.map(({ Icon, heading, body }) => (
          <div
            key={heading}
            className="rounded-xl border border-stone-200 bg-white p-6"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <Icon size={20} className="text-stone-500 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-stone-900">{heading}</h3>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={handleDismiss}
          className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          Got it, hide this.
        </button>
      </div>
    </section>
  )
}
