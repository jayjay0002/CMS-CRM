import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router'

import { type AdminProposal, ProposalStatusBadge } from '@/entities/proposal'

type Props = {
  proposal: AdminProposal
  bookingPath: string
  bookingReference: string | null
  onBack: (event: MouseEvent<HTMLAnchorElement>) => void
  // Save state (drafts) or "Sent …" (sent proposals).
  status: ReactNode
  actions: ReactNode
}

// One row across the top: where you are, how it's saving, and what you can do.
export function ActionBar({ proposal, bookingPath, bookingReference, onBack, status, actions }: Props) {
  return (
    <div className="shrink-0 border-b-2 border-ink/15 bg-white">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
        <Link
          to={bookingPath}
          onClick={onBack}
          className="font-semibold whitespace-nowrap underline decoration-cherry decoration-2 underline-offset-4"
        >
          ← <span className="font-mono">{bookingReference ?? 'Booking'}</span>
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl">Proposal</h1>
          <ProposalStatusBadge proposal={proposal} />
        </div>
        <div className="min-w-0">{status}</div>
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      </div>
    </div>
  )
}
