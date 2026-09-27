import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type SectionType, setSectionVisibility, siteKeys } from '@/entities/site'

type Variables = {
  type: SectionType
  isVisible: boolean
}

export function useSetSectionVisibility() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ type, isVisible }: Variables) => setSectionVisibility(type, isVisible),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: siteKeys.all }),
  })
}
