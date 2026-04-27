import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Service role client — bypasses RLS. Only use in Server Actions and Route Handlers.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
