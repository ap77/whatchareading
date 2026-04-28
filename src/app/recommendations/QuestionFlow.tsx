'use client'

import { useState } from 'react'
import GenerateButton from './GenerateButton'

interface Question {
  id: string
  text: string
  options: [{ label: string; value: string }, { label: string; value: string }]
}

const QUESTIONS: Question[] = [
  {
    id: 'intensity',
    text: "What kind of read are you in the mood for?",
    options: [
      { label: "Something that hits hard emotionally", value: "emotionally intense, high emotional stakes" },
      { label: "Something I can read more lightly", value: "lighter, less emotionally demanding" },
    ],
  },
  {
    id: 'pacing',
    text: "How do you want to move through it?",
    options: [
      { label: "Fast — I want to be pulled along", value: "fast-paced and propulsive" },
      { label: "Slow — I want to linger", value: "slow and meditative" },
    ],
  },
  {
    id: 'world',
    text: "Where do you want to go?",
    options: [
      { label: "Familiar — similar world to what I've been reading", value: "familiar setting or genre" },
      { label: "Somewhere completely different", value: "new territory, different from recent reads" },
    ],
  },
  {
    id: 'ending',
    text: "How do you feel about dark or ambiguous endings?",
    options: [
      { label: "I need some hope in there", value: "hopeful or resolved ending" },
      { label: "Dark or unresolved is fine — I can take it", value: "dark or ambiguous ending is fine" },
    ],
  },
  {
    id: 'surprise',
    text: "Comfort or discovery?",
    options: [
      { label: "More of what I already know I love", value: "comfort read, similar to favorites" },
      { label: "Surprise me — I'm open to something unexpected", value: "willing to be surprised, open to unexpected directions" },
    ],
  },
]

export default function QuestionFlow() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  function handleAnswer(questionId: string, value: string) {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="text-center animate-fade-up">
        <p className="text-stone-700 font-medium mb-1">Got it.</p>
        <p className="text-stone-400 text-sm mb-8">Ready to find your next read?</p>
        <GenerateButton label="Find my next read" answers={answers} />
      </div>
    )
  }

  const question = QUESTIONS[currentIndex]

  return (
    <div className="max-w-md mx-auto">
      <div className="flex gap-2 justify-center mb-10">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-6 h-2 bg-stone-900'
                : i < currentIndex
                ? 'w-2 h-2 bg-stone-400'
                : 'w-2 h-2 bg-stone-200'
            }`}
          />
        ))}
      </div>

      <div key={currentIndex} className="animate-fade-up">
        <h2 className="text-xl font-semibold text-stone-900 text-center mb-8 leading-snug">
          {question.text}
        </h2>
        <div className="flex flex-col gap-3">
          {question.options.map(option => (
            <button
              key={option.value}
              onClick={() => handleAnswer(question.id, option.value)}
              className="group w-full rounded-xl border border-stone-200 bg-white px-5 py-4 text-sm text-stone-700 text-left hover:border-amber-400 hover:bg-amber-50 hover:shadow-sm active:scale-[0.99] transition-all"
            >
              <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
