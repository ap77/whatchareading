'use server'

import { createClient } from '@/lib/supabase/server'

export async function dismissOnboarding(): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_profiles')
    .upsert(
      { user_id: user.id, onboarding_dismissed_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )

  if (error) return { error: 'Failed to dismiss onboarding' }
  return { success: true }
}
