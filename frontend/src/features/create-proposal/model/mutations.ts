import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type AdminProposal, createProposal, duplicateProposal, proposalKeys } from '@/entities/proposal'

function useCacheNewDraft() {
  const queryClient = useQueryClient()
  return (draft: AdminProposal) => {
    queryClient.setQueryData(proposalKeys.detail(draft.id), draft)
    return queryClient.invalidateQueries({ queryKey: proposalKeys.forBooking(draft.booking_id) })
  }
}

// A fresh draft pre-filled by the server with the booking's package.
export function useCreateProposal(bookingId: number) {
  const cacheNewDraft = useCacheNewDraft()
  return useMutation({ mutationFn: () => createProposal(bookingId), onSuccess: cacheNewDraft })
}

// Sent proposals are read-only; changing one means starting a copy.
export function useDuplicateProposal() {
  const cacheNewDraft = useCacheNewDraft()
  return useMutation({ mutationFn: (proposalId: number) => duplicateProposal(proposalId), onSuccess: cacheNewDraft })
}
