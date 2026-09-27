import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { emailLogKeys } from '@/entities/email-log'
import { type AdminProposal, proposalKeys, sendProposal } from '@/entities/proposal'
import { saveErrorMessage } from '@/shared/api'
import { buttonClasses, FormMessage } from '@/shared/ui'

const KEEP_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-2 font-semibold hover:bg-butter-soft'

function useSendProposal(proposal: AdminProposal) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => sendProposal(proposal.id),
    onSuccess: (sent) => {
      queryClient.setQueryData(proposalKeys.detail(proposal.id), sent)
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: proposalKeys.forBooking(proposal.booking_id) }),
        queryClient.invalidateQueries({ queryKey: emailLogKeys.forBooking(proposal.booking_id) }),
      ])
    },
  })
}

type Props = {
  proposal: AdminProposal
  customerEmail: string
  // Unsaved edits would be lost: sending uses what's saved.
  hasUnsavedChanges: boolean
  // The proposal becomes read-only once sent; the page shows the confirmation and link.
  onSent: (sent: AdminProposal) => void
}

export function SendProposalPanel({ proposal, customerEmail, hasUnsavedChanges, onSent }: Props) {
  const send = useSendProposal(proposal)
  const [isConfirming, setIsConfirming] = useState(false)

  if (!isConfirming) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          disabled={hasUnsavedChanges}
          className={buttonClasses('primary', 'px-5 py-2.5')}
        >
          Send to customer
        </button>
        {hasUnsavedChanges && <p className="text-sm text-ink/70">Save your changes before sending.</p>}
      </div>
    )
  }

  return (
    <div role="group" aria-label="Confirm send" className="space-y-3 rounded-2xl border-2 border-ink bg-butter-soft p-4">
      <p className="font-semibold">
        This emails {customerEmail} a link to view and accept the proposal. After sending, it can’t be edited
        (you can duplicate it instead).
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => send.mutate(undefined, { onSuccess: onSent, onSettled: () => setIsConfirming(false) })}
          disabled={send.isPending}
          className={buttonClasses('primary', 'px-5 py-2')}
        >
          {send.isPending ? 'Sending…' : 'Yes, send it'}
        </button>
        <button type="button" onClick={() => setIsConfirming(false)} className={KEEP_BUTTON}>
          Not yet
        </button>
      </div>
      {send.isError && <FormMessage tone="error">{saveErrorMessage(send.error)}</FormMessage>}
    </div>
  )
}
