import { useQueryClient } from '@tanstack/react-query'

import { adminKeys } from '@/entities/admin'
import { getSupabase } from '@/shared/api'

export function useLogout(): () => Promise<void> {
  const queryClient = useQueryClient()
  return async () => {
    const supabase = await getSupabase()
    await supabase?.auth.signOut()
    queryClient.removeQueries({ queryKey: adminKeys.all })
  }
}
