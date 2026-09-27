import { useMutation, useQueryClient } from '@tanstack/react-query'

import { proposalKeys, type ProposalDraftInput, updateProposal } from '@/entities/proposal'

export function useUpdateProposal(proposalId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (draft: ProposalDraftInput) => updateProposal(proposalId, draft),
    onSuccess: (proposal) => {
      queryClient.setQueryData(proposalKeys.detail(proposalId), proposal)
      return queryClient.invalidateQueries({ queryKey: proposalKeys.forBooking(proposal.booking_id) })
    },
  })
}
