import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { type AdminProposal, deleteProposal, invalidateProposalOverview, proposalKeys } from '@/entities/proposal'
import { saveErrorMessage } from '@/shared/api'
import { FormMessage } from '@/shared/ui'

const DANGER_BUTTON =
  'rounded-full border-2 border-cherry-deep bg-white px-4 py-2 font-semibold text-cherry-deep hover:bg-cherry/10 disabled:opacity-50'
const CONFIRM_BUTTON =
  'rounded-full border-2 border-cherry-deep bg-cherry px-4 py-2 font-semibold text-kernel hover:bg-cherry-deep disabled:opacity-50'
const KEEP_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-2 font-semibold hover:bg-butter-soft'

type Props = {
  proposal: AdminProposal
  onDeleted: () => void
}

// Drafts only (the server refuses anything else).
export function DeleteProposalButton({ proposal, onDeleted }: Props) {
  const queryClient = useQueryClient()
  const [isConfirming, setIsConfirming] = useState(false)
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

  if (!isConfirming) {
    return (
      <button type="button" onClick={() => setIsConfirming(true)} className={DANGER_BUTTON}>
        Delete draft
      </button>
    )
  }

  return (
    <div role="group" aria-label="Confirm delete" className="space-y-2 rounded-2xl border-2 border-cherry-deep bg-cherry/5 p-3">
      <p className="font-semibold">Delete this draft? This can’t be undone.</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => remove.mutate(undefined, { onSuccess: onDeleted })}
          disabled={remove.isPending}
          className={CONFIRM_BUTTON}
        >
          {remove.isPending ? 'Deleting…' : 'Yes, delete it'}
        </button>
        <button type="button" onClick={() => setIsConfirming(false)} className={KEEP_BUTTON}>
          Keep it
        </button>
      </div>
      {remove.isError && <FormMessage tone="error">{saveErrorMessage(remove.error)}</FormMessage>}
    </div>
  )
}
