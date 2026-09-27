import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteSection, siteKeys } from '@/entities/site'

export function useDeleteSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: siteKeys.all }),
  })
}
