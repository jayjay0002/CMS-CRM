import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type AdminProposal, deleteProposal, invalidateProposalOverview, proposalKeys } from '@/entities/proposal'
import { saveErrorMessage } from '@/shared/api'
import { ConfirmDialog, FormMessage } from '@/shared/ui'

type Props = {
  proposal: AdminProposal
  isOpen: boolean
  onClose: () => void
  onDeleted: () => void
}

// Drafts only (the server refuses anything else).
export function DeleteDraftDialog({ proposal, isOpen, onClose, onDeleted }: Props) {
  const queryClient = useQueryClient()
  const remove = useMutation({
    mutationFn: () => deleteProposal(proposal.id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: proposalKeys.detail(proposal.id) })
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: proposalKeys.forBooking(proposal.booking_id) }),
        invalidateProposalOverview(queryClient),
      ])
    },
  })

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Delete this draft?"
      tone="danger"
      confirmLabel="Yes, delete it"
      busyLabel="Deleting…"
      cancelLabel="Keep it"
      isBusy={remove.isPending}
      onConfirm={() => remove.mutate(undefined, { onSuccess: onDeleted })}
      onClose={onClose}
    >
      <p>This can’t be undone.</p>
      {remove.isError && <FormMessage tone="error">{saveErrorMessage(remove.error)}</FormMessage>}
    </ConfirmDialog>
  )
}
