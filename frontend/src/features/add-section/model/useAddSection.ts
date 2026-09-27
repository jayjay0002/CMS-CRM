import { useMutation, useQueryClient } from '@tanstack/react-query'

import { addSection, siteKeys } from '@/entities/site'

export function useAddSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: siteKeys.all }),
  })
}
