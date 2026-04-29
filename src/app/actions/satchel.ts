'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveToSatchel(recommendationId: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('satchel_items')
    .insert({ user_id: user.id, recommendation_id: recommendationId })

  if (error) {
    if (error.code === '23505') return { success: true } // already saved
    return { error: 'Failed to save to satchel' }
  }

  return { success: true }
}

export async function removeFromSatchel(satchelItemId: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('satchel_items')
    .delete()
    .eq('id', satchelItemId)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to remove from satchel' }

  revalidatePath('/satchel')
  return { success: true }
}
