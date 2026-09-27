import { type ReactNode, useState } from 'react'
import { Link, useParams } from 'react-router'

import { useBooking } from '@/entities/booking'
import { type AdminProposal, isDraft, isProposalNotFound, useProposal } from '@/entities/proposal'
import { ROUTES } from '@/shared/config'

import { DraftWorkspace } from './DraftWorkspace'
import { ReadOnlyWorkspace } from './ReadOnlyWorkspace'

const LINK = 'font-semibold underline decoration-cherry decoration-2 underline-offset-4'
const RETRY_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-1.5 font-semibold hover:bg-butter-soft'

function Message({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl space-y-3 p-8">{children}</div>
}

export function AdminProposalPage() {
  const { proposalId } = useParams()
  const id = Number(proposalId)
  const proposal = useProposal(id)

  if (!Number.isInteger(id) || isProposalNotFound(proposal.error)) {
    return (
      <Message>
        <h1 className="font-display text-3xl">Proposal not found</h1>
        <p className="text-ink/75">It may have been deleted, or the link is wrong.</p>
        <Link to={ROUTES.adminProposals} className={LINK}>
          ← All proposals
        </Link>
      </Message>
    )
  }
  if (proposal.isPending) {
    return (
      <Message>
        <div role="status" className="space-y-3">
          <span className="sr-only">Loading proposal…</span>
          <div className="h-10 w-72 animate-pulse rounded-full bg-ink/10" />
          <div className="h-80 animate-pulse rounded-3xl bg-ink/10" />
        </div>
      </Message>
    )
  }
  if (proposal.isError) {
    return (
      <Message>
        <div role="alert" className="space-y-3 rounded-2xl border-2 border-cherry bg-cherry/5 p-6">
          <p className="font-semibold">We couldn’t load this proposal.</p>
          <button type="button" onClick={() => proposal.refetch()} className={RETRY_BUTTON}>
            Try again
          </button>
        </div>
      </Message>
    )
  }

  return <ProposalScreen proposal={proposal.data} />
}

// Loaded: fetch its booking and show the editor (drafts) or the read-only view.
function ProposalScreen({ proposal }: { proposal: AdminProposal }) {
  const booking = useBooking(proposal.booking_id)
  // Set when the proposal was sent from this screen, to confirm it on the read-only view.
  const [sentTo, setSentTo] = useState<string | null>(null)

  return isDraft(proposal) ? (
    <DraftWorkspace
      // A fresh editor per proposal, so no stale values carry over after "Duplicate".
      key={proposal.id}
      proposal={proposal}
      booking={booking.data}
      onSent={(_sent, to) => setSentTo(to)}
    />
  ) : (
    <ReadOnlyWorkspace proposal={proposal} booking={booking.data} sentTo={sentTo} />
  )
}
