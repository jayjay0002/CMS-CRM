import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useState } from 'react'

import {
  acceptProposal,
  declineProposal,
  PROPOSAL_LIMITS,
  proposalKeys,
  type PublicProposal,
} from '@/entities/proposal'
import { saveErrorMessage } from '@/shared/api'
import { buttonClasses, FormMessage, INPUT_CLASSES } from '@/shared/ui'

const RESPONSES = {
  accept: 'accept',
  decline: 'decline',
} as const

type Response = (typeof RESPONSES)[keyof typeof RESPONSES]

const SECONDARY_BUTTON =
  'rounded-full border-2 border-ink bg-white px-5 py-2.5 font-semibold hover:bg-butter-soft disabled:opacity-50'
const REASON_ROWS = 3

type Props = {
  token: string
  proposal: PublicProposal
}

// Accept or decline, each behind a confirm step. The page re-renders from the server's answer.
export function ProposalResponseActions({ token, proposal }: Props) {
  const queryClient = useQueryClient()
  const reasonId = useId()
  const [confirming, setConfirming] = useState<Response | null>(null)
  const [reason, setReason] = useState('')

  const respond = useMutation({
    mutationFn: (response: Response) =>
      response === RESPONSES.accept ? acceptProposal(token) : declineProposal(token, reason.trim() || null),
    onSuccess: (updated) => queryClient.setQueryData(proposalKeys.public(token), updated),
  })

  if (confirming === RESPONSES.accept) {
    return (
      <div role="group" aria-label="Confirm accept" className="space-y-3 rounded-2xl border-2 border-ink bg-butter-soft p-4">
        <p className="font-semibold">
          Accept this proposal and confirm your booking for {proposal.event.package_name}?
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => respond.mutate(RESPONSES.accept)}
            disabled={respond.isPending}
            className={buttonClasses('primary', 'px-5 py-2.5')}
          >
            {respond.isPending ? 'Confirming…' : 'Yes, accept'}
          </button>
          <button type="button" onClick={() => setConfirming(null)} className={SECONDARY_BUTTON}>
            Go back
          </button>
        </div>
        {respond.isError && <FormMessage tone="error">{saveErrorMessage(respond.error)}</FormMessage>}
      </div>
    )
  }

  if (confirming === RESPONSES.decline) {
    return (
      <div role="group" aria-label="Confirm decline" className="space-y-3 rounded-2xl border-2 border-ink bg-white p-4">
        <label htmlFor={reasonId} className="block font-semibold">
          Want to tell us why? <span className="font-normal text-ink/70">(optional)</span>
        </label>
        <textarea
          id={reasonId}
          rows={REASON_ROWS}
          maxLength={PROPOSAL_LIMITS.declineReasonMaxLength}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Found another option, changed plans, budget…"
          className={INPUT_CLASSES}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => respond.mutate(RESPONSES.decline)}
            disabled={respond.isPending}
            className="rounded-full border-2 border-cherry-deep bg-cherry px-5 py-2.5 font-semibold text-kernel hover:bg-cherry-deep disabled:opacity-50"
          >
            {respond.isPending ? 'Sending…' : 'Decline proposal'}
          </button>
          <button type="button" onClick={() => setConfirming(null)} className={SECONDARY_BUTTON}>
            Go back
          </button>
        </div>
        {respond.isError && <FormMessage tone="error">{saveErrorMessage(respond.error)}</FormMessage>}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => setConfirming(RESPONSES.accept)}
        className={buttonClasses('primary', 'px-7 py-3 text-lg')}
      >
        Accept proposal
      </button>
      <button type="button" onClick={() => setConfirming(RESPONSES.decline)} className={SECONDARY_BUTTON}>
        Decline
      </button>
    </div>
  )
}
