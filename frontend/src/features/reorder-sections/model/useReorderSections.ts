import { useMutation, useQueryClient } from '@tanstack/react-query'

import { reorderSections, siteKeys } from '@/entities/site'

export function useReorderSections() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderSections,
    onSuccess: (saved) => {
      // Show the new order right away, then refresh the public page too.
      queryClient.setQueryData(siteKeys.adminSections(), saved)
      return queryClient.invalidateQueries({ queryKey: siteKeys.all })
    },
  })
}
