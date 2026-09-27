export const adminKeys = {
  all: ['admin'] as const,
  // Keyed by the Supabase user id so switching accounts never shows the previous admin.
  me: (userId: string) => [...adminKeys.all, 'me', userId] as const,
}
