import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type AdminUpdatePayload, adminKeys, fetchSignInLink, updateAdmin } from '@/entities/admin'

export function useUpdateAdmin(adminId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AdminUpdatePayload) => updateAdmin(adminId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users() }),
  })
}

export function useSignInLink(adminId: number) {
  return useMutation({ mutationFn: () => fetchSignInLink(adminId) })
}
