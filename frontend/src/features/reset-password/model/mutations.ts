import { useMutation } from '@tanstack/react-query'

import { getSupabase } from '@/shared/api'
import { ROUTES } from '@/shared/config'

async function requireSupabase() {
  const supabase = await getSupabase()
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

async function requestPasswordReset(email: string): Promise<void> {
  const redirectTo = `${window.location.origin}${ROUTES.adminResetPassword}`
  const supabase = await requireSupabase()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
}

async function setNewPassword(password: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: requestPasswordReset })
}

export function useSetNewPassword() {
  return useMutation({ mutationFn: setNewPassword })
}
