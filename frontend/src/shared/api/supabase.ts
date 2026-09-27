import type { SupabaseClient } from '@supabase/supabase-js'

import { env } from '@/shared/config'

const { supabaseUrl, supabasePublishableKey } = env

// False when the Supabase env vars aren't set; the public site works without them.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

let clientPromise: Promise<SupabaseClient | null> | null = null

// supabase-js is loaded on first use so the public site doesn't download it.
// The client persists the session in localStorage and refreshes it automatically.
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!supabaseUrl || !supabasePublishableKey) return Promise.resolve(null)
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(supabaseUrl, supabasePublishableKey),
  )
  return clientPromise
}
