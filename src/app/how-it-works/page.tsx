export default function HowItWorksPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-stone-900 mb-3">How it works</h1>
      <p className="text-stone-600 leading-relaxed mb-10">Here&apos;s the gist.</p>

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="text-base font-semibold text-stone-900 mb-3">What this is</h2>
          <p className="text-stone-600 leading-relaxed">
            A book recommender that pays attention. Tell us books you&apos;ve loved and we&apos;ll show you what&apos;s in their DNA — the obvious stuff and the not-so-obvious — and use it to suggest what to read next.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-stone-900 mb-3">Adding books</h2>
          <p className="text-stone-600 leading-relaxed">
            Search a book, pick the chips that fit why you liked it, write a note if you want. The more specific you are about what worked for you, the better the recommendations get.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-stone-900 mb-3">Recommendations</h2>
          <p className="text-stone-600 leading-relaxed">
            We&apos;ll show you six picks at a time. Save the ones you want to read into your satchel. Skip the ones that aren&apos;t for you — we won&apos;t show them again. When you&apos;ve gone through six, you can ask for more.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-stone-900 mb-3">Your satchel</h2>
          <p className="text-stone-600 leading-relaxed">
            That&apos;s your &ldquo;want to read&rdquo; pile. Books you&apos;ve saved live there with the original reasoning for why we suggested them. Delete anything you change your mind about.
          </p>
        </section>
      </div>
    </main>
  )
}
