'use client'

import { useState } from 'react'
import GenerateButton from './GenerateButton'

interface QuestionOption {
  label: string
  value: string
}

interface Question {
  id: string
  text: string
  options: [QuestionOption, QuestionOption]
}

type Dimension = 'intensity' | 'pacing' | 'world' | 'ending' | 'surprise'

const QUESTION_BANK: Record<Dimension, Question[]> = {
  intensity: [
    {
      id: 'intensity',
      text: "What kind of read are you in the mood for?",
      options: [
        { label: "Something that hits hard emotionally", value: "emotionally intense, high emotional stakes" },
        { label: "Something I can read more lightly", value: "lighter, less emotionally demanding" },
      ],
    },
    {
      id: 'intensity',
      text: "Are you reading to feel things or to get away from them?",
      options: [
        { label: "To feel them — bring the depth", value: "emotionally intense, high emotional stakes" },
        { label: "To get away from them — I want to be entertained, not wrung out", value: "lighter, less emotionally demanding" },
      ],
    },
    {
      id: 'intensity',
      text: "How much do you want this book to ask of you?",
      options: [
        { label: "A lot — I want to feel it", value: "emotionally demanding, high stakes" },
        { label: "Not much — I want to recharge, not process", value: "lighter, emotionally low-stakes" },
      ],
    },
  ],
  pacing: [
    {
      id: 'pacing',
      text: "How do you want to move through it?",
      options: [
        { label: "Fast — I want to be pulled along", value: "fast-paced and propulsive" },
        { label: "Slow — I want to linger", value: "slow and meditative" },
      ],
    },
    {
      id: 'pacing',
      text: "Do you want a book that keeps you up, or one that lets you put it down?",
      options: [
        { label: "Keeps me up — I want to feel compelled to keep going", value: "fast-paced and propulsive" },
        { label: "Easy to set down — I want to live my life between chapters", value: "slow and meditative" },
      ],
    },
    {
      id: 'pacing',
      text: "Late-night page-turner or slow weekend read?",
      options: [
        { label: "Page-turner — I want to feel pulled through it", value: "fast-paced and propulsive" },
        { label: "Slow weekend read — I want to linger in each chapter", value: "slow and meditative" },
      ],
    },
  ],
  world: [
    {
      id: 'world',
      text: "Where do you want to go?",
      options: [
        { label: "Familiar — similar world to what I've been reading", value: "familiar setting or genre" },
        { label: "Somewhere completely different", value: "new territory, different from recent reads" },
      ],
    },
    {
      id: 'world',
      text: "Real world, or something else entirely?",
      options: [
        { label: "Real world, or close to it — I want to recognize the landscape", value: "familiar setting or genre" },
        { label: "Something else — I want the world itself to be part of the discovery", value: "new territory, different from recent reads" },
      ],
    },
    {
      id: 'world',
      text: "How disorienting are you okay with the setting being?",
      options: [
        { label: "Not at all — I want to feel at home in it immediately", value: "familiar setting or genre" },
        { label: "Very — I'm okay having to find my footing", value: "new territory, different from recent reads" },
      ],
    },
  ],
  ending: [
    {
      id: 'ending',
      text: "How do you feel about dark or ambiguous endings?",
      options: [
        { label: "I need some hope in there", value: "hopeful or resolved ending" },
        { label: "Dark or unresolved is fine — I can take it", value: "dark or ambiguous ending is fine" },
      ],
    },
    {
      id: 'ending',
      text: "What do you need from the last page?",
      options: [
        { label: "Resolution — I want things tied up, even if imperfectly", value: "hopeful or resolved ending" },
        { label: "Honesty — even if that means messy or unresolved", value: "dark or ambiguous ending is fine" },
      ],
    },
    {
      id: 'ending',
      text: "When you close the book, what do you want to be carrying?",
      options: [
        { label: "Warmth — a feeling that things worked out", value: "hopeful or resolved ending" },
        { label: "Weight — something that lingers in an uncomfortable way", value: "dark or ambiguous ending is fine" },
      ],
    },
  ],
  surprise: [
    {
      id: 'surprise',
      text: "Comfort or discovery?",
      options: [
        { label: "More of what I already know I love", value: "comfort read, similar to favorites" },
        { label: "Surprise me — I'm open to something unexpected", value: "willing to be surprised, open to unexpected directions" },
      ],
    },
    {
      id: 'surprise',
      text: "Nesting mood or exploring mood?",
      options: [
        { label: "Nesting — more of what I already know I love", value: "comfort read, similar to favorites" },
        { label: "Exploring — I want to find something I didn't know I'd love", value: "willing to be surprised, open to unexpected directions" },
      ],
    },
    {
      id: 'surprise',
      text: "Sure thing or a gamble?",
      options: [
        { label: "Sure thing — I want something that's definitely going to work for me", value: "comfort read, similar to favorites" },
        { label: "Gamble — I'll risk a miss for a chance at a new favorite", value: "willing to be surprised, open to unexpected directions" },
      ],
    },
  ],
}

const DIMENSIONS: Dimension[] = ['intensity', 'pacing', 'world', 'ending', 'surprise']
const SESSION_KEY = 'wrq_question_indices'

function selectQuestions(): Question[] {
  const stored = sessionStorage.getItem(SESSION_KEY)
  if (stored) {
    try {
      const indices = JSON.parse(stored) as number[]
      if (Array.isArray(indices) && indices.length === DIMENSIONS.length) {
        return DIMENSIONS.map((dim, i) => QUESTION_BANK[dim][indices[i]])
      }
    } catch {
      // fall through to fresh selection
    }
  }
  const indices = DIMENSIONS.map(dim => Math.floor(Math.random() * QUESTION_BANK[dim].length))
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(indices))
  return DIMENSIONS.map((dim, i) => QUESTION_BANK[dim][indices[i]])
}

export default function QuestionFlow() {
  const [questions] = useState<Question[]>(() => selectQuestions())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  function handleAnswer(questionId: string, value: string) {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setDone(true)
    }
  }

  function handleGenerateSuccess() {
    sessionStorage.removeItem(SESSION_KEY)
  }

  if (done) {
    return (
      <div className="text-center animate-fade-up">
        <p className="text-stone-700 font-medium mb-1">Got it.</p>
        <p className="text-stone-400 text-sm mb-8">Ready to find your next read?</p>
        <GenerateButton label="Find my next read" answers={answers} onSuccess={handleGenerateSuccess} />
      </div>
    )
  }

  const question = questions[currentIndex]

  return (
    <div className="max-w-md mx-auto">
      <div className="flex gap-2 justify-center mb-10">
        {questions.map((_, i) => (
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
