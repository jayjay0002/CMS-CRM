import { useMutation, useQueryClient } from '@tanstack/react-query'

import { siteKeys, updateTheme } from '@/entities/site'

export function useUpdateTheme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateTheme,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: siteKeys.all }),
  })
}
