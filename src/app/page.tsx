import Link from "next/link";

const SPINES = [
  { h: 'h-28', color: 'bg-stone-800' },
  { h: 'h-36', color: 'bg-amber-700' },
  { h: 'h-24', color: 'bg-stone-600' },
  { h: 'h-40', color: 'bg-amber-800' },
  { h: 'h-32', color: 'bg-stone-700' },
  { h: 'h-20', color: 'bg-amber-600' },
  { h: 'h-36', color: 'bg-stone-900' },
  { h: 'h-28', color: 'bg-amber-900' },
  { h: 'h-32', color: 'bg-stone-500' },
  { h: 'h-24', color: 'bg-amber-700' },
]

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-6 py-16 text-center">
      <div className="flex items-end gap-1.5 mb-12">
        {SPINES.map((s, i) => (
          <div key={i} className={`w-6 rounded-sm opacity-80 ${s.h} ${s.color}`} />
        ))}
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
        Know your reading DNA.
      </h1>
      <p className="mt-5 max-w-md text-base text-stone-600 leading-relaxed">
        Tell us a few books you&apos;ve loved. We&apos;ll show you what&apos;s really in them —
        and find your next one.
      </p>
      <div className="mt-10 flex gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-amber-50 hover:bg-stone-700 transition-colors"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
