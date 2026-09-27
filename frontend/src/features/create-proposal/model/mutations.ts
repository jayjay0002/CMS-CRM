import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  type AdminProposal,
  createProposal,
  duplicateProposal,
  invalidateProposalOverview,
  proposalKeys,
} from '@/entities/proposal'

function useCacheNewDraft() {
  const queryClient = useQueryClient()
  return (draft: AdminProposal) => {
    queryClient.setQueryData(proposalKeys.detail(draft.id), draft)
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: proposalKeys.forBooking(draft.booking_id) }),
      invalidateProposalOverview(queryClient),
    ])
  }
}

// A fresh draft pre-filled by the server with the booking's package.
export function useCreateProposal(bookingId: number) {
  const cacheNewDraft = useCacheNewDraft()
  return useMutation({ mutationFn: () => createProposal(bookingId), onSuccess: cacheNewDraft })
}

// Same, for when the booking is picked at the moment of creating (Proposals list).
export function useCreateProposalForBooking() {
  const cacheNewDraft = useCacheNewDraft()
  return useMutation({ mutationFn: (bookingId: number) => createProposal(bookingId), onSuccess: cacheNewDraft })
}

// Sent proposals are read-only; changing one means starting a copy.
export function useDuplicateProposal() {
  const cacheNewDraft = useCacheNewDraft()
  return useMutation({ mutationFn: (proposalId: number) => duplicateProposal(proposalId), onSuccess: cacheNewDraft })
}
