const DEFAULT_API_BASE_URL = '/api/v1'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? null,
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? null,
} as const
