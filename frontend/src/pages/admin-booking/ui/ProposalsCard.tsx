import { Link } from 'react-router'

import { BOOKING_STATUSES, type BookingDetail, formatBookingTimestamp, formatEventDate } from '@/entities/booking'
import { type AdminProposal, formatUsd, ProposalStatusBadge, useBookingProposals } from '@/entities/proposal'
import { CreateProposalButton, DuplicateProposalButton } from '@/features/create-proposal'
import { adminProposalPath } from '@/shared/config'

const CARD = 'rounded-3xl border-4 border-ink bg-white p-6 shadow-sign md:p-8'
const OPEN_LINK = 'rounded-full border-2 border-ink bg-butter px-4 py-1.5 text-sm font-bold hover:bg-butter-soft'
const RETRY_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-1.5 font-semibold hover:bg-butter-soft'

// Proposals can only go to bookings that are still open.
const QUOTABLE_STATUSES: readonly string[] = [BOOKING_STATUSES.pending, BOOKING_STATUSES.approved]

function timeline(proposal: AdminProposal): string {
  const steps = [
    `Created ${formatBookingTimestamp(proposal.created_at)}`,
    proposal.sent_at && `sent ${formatBookingTimestamp(proposal.sent_at)}`,
    proposal.viewed_at && `viewed ${formatBookingTimestamp(proposal.viewed_at)}`,
    proposal.responded_at && `answered ${formatBookingTimestamp(proposal.responded_at)}`,
  ]
  return steps.filter(Boolean).join(', ')
}

function ProposalRow({ proposal }: { proposal: AdminProposal }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border-2 border-ink/20 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <ProposalStatusBadge proposal={proposal} />
          <span className="text-lg font-bold tabular-nums">{formatUsd(proposal.total)}</span>
          <span className="text-sm text-ink/70">deposit {formatUsd(proposal.deposit)}</span>
        </div>
        <p className="text-sm text-ink/70">
          Valid until {formatEventDate(proposal.valid_until)}. {timeline(proposal)}.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link to={adminProposalPath(proposal.id)} className={OPEN_LINK}>
          Open<span className="sr-only"> proposal for {formatUsd(proposal.total)}</span>
        </Link>
        <DuplicateProposalButton proposalId={proposal.id} />
      </div>
    </li>
  )
}

export function ProposalsCard({ booking }: { booking: BookingDetail }) {
  const proposals = useBookingProposals(booking.id)
  const canQuote = QUOTABLE_STATUSES.includes(booking.status)

  function renderList() {
    if (proposals.isPending) {
      return (
        <div role="status" className="h-20 animate-pulse rounded-2xl bg-ink/10">
          <span className="sr-only">Loading proposals…</span>
        </div>
      )
    }
    if (proposals.isError) {
      return (
        <div role="alert" className="space-y-2">
          <p>Couldn’t load the proposals.</p>
          <button type="button" onClick={() => proposals.refetch()} className={RETRY_BUTTON}>
            Try again
          </button>
        </div>
      )
    }
    if (proposals.data.length === 0) {
      return (
        <p className="text-ink/70">
          No proposals yet. Create one to send {booking.customer_name.split(' ')[0]} a quote they can accept online.
        </p>
      )
    }
    return (
      <ul className="space-y-3">
        {proposals.data.map((proposal) => (
          <ProposalRow key={proposal.id} proposal={proposal} />
        ))}
      </ul>
    )
  }

  return (
    <section aria-labelledby="proposals-heading" className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="proposals-heading" className="font-display text-2xl">Proposals</h2>
        {canQuote && <CreateProposalButton bookingId={booking.id} />}
      </div>
      <div className="mt-4">{renderList()}</div>
      {!canQuote && (
        <p className="mt-3 text-sm text-ink/65">New proposals can only be sent for pending or approved bookings.</p>
      )}
    </section>
  )
}
