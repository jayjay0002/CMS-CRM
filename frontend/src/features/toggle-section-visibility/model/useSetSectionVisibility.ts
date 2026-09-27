import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setSectionVisibility, siteKeys } from '@/entities/site'

type Variables = {
  id: number
  isVisible: boolean
}

export function useSetSectionVisibility() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isVisible }: Variables) => setSectionVisibility(id, isVisible),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: siteKeys.all }),
  })
}
