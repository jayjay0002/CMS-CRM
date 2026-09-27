import { useMutation, useQueryClient } from '@tanstack/react-query'

import { siteKeys, updateSiteSettings } from '@/entities/site'

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: siteKeys.all }),
  })
}
