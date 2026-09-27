import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type SectionType, type SiteSection, siteKeys, updateSectionContent } from '@/entities/site'

function saveSection<T extends SectionType>(section: SiteSection<T>) {
  return updateSectionContent(section.type, section.content)
}

export function useUpdateSectionContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (section: SiteSection) => saveSection(section),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: siteKeys.all }),
  })
}
