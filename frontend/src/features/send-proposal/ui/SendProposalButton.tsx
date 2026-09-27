import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useState } from 'react'

import { formatEventDate } from '@/entities/booking'
import { emailLogKeys } from '@/entities/email-log'
import { type AdminProposal, formatCents, invalidateProposalOverview, proposalKeys, sendProposal } from '@/entities/proposal'
import { saveErrorMessage } from '@/shared/api'
import { buttonClasses, ConfirmDialog, FormMessage } from '@/shared/ui'

// onSent runs before the cache update: once the cached proposal is "sent", the page swaps this
// editor for the read-only view and per-call callbacks of the unmounted button would never fire.
function useSendProposal(proposal: AdminProposal, onSent: (sent: AdminProposal) => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => sendProposal(proposal.id),
    onSuccess: (sent) => {
      onSent(sent)
      queryClient.setQueryData(proposalKeys.detail(proposal.id), sent)
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: proposalKeys.forBooking(proposal.booking_id) }),
        queryClient.invalidateQueries({ queryKey: emailLogKeys.forBooking(proposal.booking_id) }),
        invalidateProposalOverview(queryClient),
      ])
    },
  })
}

type Props = {
  proposal: AdminProposal
  customerEmail: string
  totalCents: number
  depositCents: number
  validUntil: string
  // Reasons it can't be sent yet; the button stays disabled and explains them.
  blockers: readonly string[]
  // Saves pending edits first; resolves to false if they couldn't be saved.
  beforeSend: () => Promise<boolean>
  onSent: (sent: AdminProposal) => void
}

export function SendProposalButton({
  proposal,
  customerEmail,
  totalCents,
  depositCents,
  validUntil,
  blockers,
  beforeSend,
  onSent,
}: Props) {
  const helpId = useId()
  const send = useSendProposal(proposal, onSent)
  const [isOpen, setIsOpen] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const isBlocked = blockers.length > 0

  async function confirm() {
    setSaveFailed(false)
    const saved = await beforeSend()
    if (!saved) {
      setSaveFailed(true)
      return
    }
    send.mutate(undefined, { onSuccess: () => setIsOpen(false) })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          send.reset()
          setIsOpen(true)
        }}
        aria-disabled={isBlocked}
        disabled={isBlocked}
        aria-describedby={isBlocked ? helpId : undefined}
        title={isBlocked ? blockers.join(' ') : undefined}
        className={buttonClasses('primary', 'px-5 py-2 whitespace-nowrap')}
      >
        Send to customer
      </button>
      {isBlocked && (
        <span id={helpId} className="sr-only">
          Can’t send yet: {blockers.join(' ')}
        </span>
      )}
      <ConfirmDialog
        isOpen={isOpen}
        title="Send this proposal?"
        confirmLabel="Send it"
        busyLabel="Sending…"
        isBusy={send.isPending}
        cancelLabel="Not yet"
        onConfirm={confirm}
        onClose={() => setIsOpen(false)}
      >
        <p>
          We’ll email <span className="font-semibold">{customerEmail}</span> a link to view and accept it.
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-2xl border-2 border-ink/20 bg-white p-4">
          <dt className="text-ink/70">Total</dt>
          <dd className="font-bold tabular-nums">{formatCents(totalCents)}</dd>
          <dt className="text-ink/70">Deposit</dt>
          <dd className="tabular-nums">{formatCents(depositCents)}</dd>
          <dt className="text-ink/70">Valid until</dt>
          <dd>{formatEventDate(validUntil)}</dd>
        </dl>
        <p className="text-sm text-ink/70">After sending it can’t be edited. You can duplicate it instead.</p>
        {saveFailed && <FormMessage tone="error">Your latest changes couldn’t be saved, so nothing was sent.</FormMessage>}
        {send.isError && <FormMessage tone="error">{saveErrorMessage(send.error)}</FormMessage>}
      </ConfirmDialog>
    </div>
  )
}
