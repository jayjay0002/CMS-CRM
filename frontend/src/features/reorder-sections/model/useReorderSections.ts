import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type AdminSection, reorderSections, siteKeys } from '@/entities/site'

// Sections in the given id order, with positions renumbered to match.
function inOrder(sections: readonly AdminSection[], ids: readonly number[]): AdminSection[] {
  const byId = new Map(sections.map((section) => [section.id, section]))
  return ids.flatMap((id, position) => {
    const section = byId.get(id)
    return section ? [{ ...section, position }] : []
  })
}

type Context = { previous: AdminSection[] | undefined }

// Saves a new order. The list (and the live preview built from it) updates immediately and
// rolls back if the server refuses.
export function useReorderSections() {
  const queryClient = useQueryClient()
  const key = siteKeys.adminSections()

  return useMutation<AdminSection[], Error, number[], Context>({
    mutationFn: reorderSections,
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<AdminSection[]>(key)
      if (previous) queryClient.setQueryData(key, inOrder(previous, ids))
      return { previous }
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(key, saved)
      // Refresh the public page too.
      return queryClient.invalidateQueries({ queryKey: siteKeys.public() })
    },
  })
}
