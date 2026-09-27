import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminKeys, inviteAdmin } from '@/entities/admin'

export function useInviteAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inviteAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users() }),
  })
}
