import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type SiteSection, siteKeys, updateSectionContent } from '@/entities/site'

export function useUpdateSectionContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (section: SiteSection) => updateSectionContent(section.id, section.content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: siteKeys.all }),
  })
}
