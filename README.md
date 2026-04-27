# Whatcha Reading

A book taste profiler and recommender. You tell it a few books you've loved; it deconstructs each one into a "DNA" of attributes (some obvious, some surprising), asks a few short questions about what you want next, and recommends a book with a specific explanation of why it fits your taste.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then copy your project URL and anon key.

3. **Create `.env.local`** by copying the example:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `ANTHROPIC_API_KEY`.

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Current status

Step 1 complete: project scaffold with Supabase auth (signup, login, protected dashboard).

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS**
- **Supabase** — auth + Postgres via `@supabase/ssr`
- **Anthropic SDK** — Claude for DNA analysis and recommendations (`claude-sonnet-4-6`, configurable via `CLAUDE_MODEL` env var)
- **Deployment target** — Node on VPS behind nginx (whatchareading.quill.build)
