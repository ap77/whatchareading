import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-stone-900 sm:text-6xl">
        Whatcha reading?
      </h1>
      <p className="mt-6 max-w-xl text-lg text-stone-600 leading-relaxed">
        Tell us a few books you&apos;ve loved. We&apos;ll show you what&apos;s in
        their DNA — and what to read next.
      </p>
      <div className="mt-10 flex gap-4">
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
