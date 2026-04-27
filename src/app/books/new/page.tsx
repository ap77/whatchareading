import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookEntryForm from './BookEntryForm'

export default async function NewBookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <BookEntryForm />
}
