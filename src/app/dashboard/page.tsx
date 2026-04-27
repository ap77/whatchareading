import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-stone-900">
        What are you reading?
      </h1>
      <p className="mt-4 text-stone-500 text-sm">
        Signed in as {user.email}
      </p>
      <p className="mt-6 text-stone-400 text-sm italic">
        Book entry coming soon.
      </p>
    </main>
  )
}
