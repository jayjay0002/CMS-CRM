import { formatEventDate, formatEventTime } from '@/entities/booking'
import {
  PROPOSAL_STATUSES,
  ProposalItemsTable,
  ProposalTotalsTable,
  type PublicProposal,
  totalsFromServer,
} from '@/entities/proposal'
import { ProposalResponseActions } from '@/features/respond-to-proposal'

import { ContactLinks } from './ContactLinks'

const CARD = 'rounded-3xl border-4 border-ink bg-white p-6 shadow-sign-lg md:p-10 print:border-2 print:shadow-none'

function StatusNotice({ proposal }: { proposal: PublicProposal }) {
  if (proposal.status === PROPOSAL_STATUSES.accepted) {
    return (
      <div role="status" className="rounded-2xl border-2 border-ink bg-butter p-5">
        <p className="font-display text-2xl">Accepted — thank you!</p>
        <p className="mt-1">Your booking is confirmed. We’ll be in touch about the deposit.</p>
      </div>
    )
  }
  if (proposal.status === PROPOSAL_STATUSES.declined) {
    return (
      <div role="status" className="rounded-2xl border-2 border-ink/40 bg-white p-5">
        <p className="font-semibold">You declined this proposal.</p>
        <p className="mt-1">
          Changed your mind? Reach us at <ContactLinks business={proposal.business} />.
        </p>
      </div>
    )
  }
  if (proposal.status === PROPOSAL_STATUSES.sent && proposal.is_expired) {
    return (
      <div role="status" className="rounded-2xl border-2 border-dashed border-ink/50 bg-white p-5">
        <p className="font-semibold">This proposal expired on {formatEventDate(proposal.valid_until)}.</p>
        <p className="mt-1">
          Call or email us for an updated quote: <ContactLinks business={proposal.business} />.
        </p>
      </div>
    )
  }
  return null
}

type Props = {
  proposal: PublicProposal
  // The customer's secret token: shows Accept/Decline while the proposal can still be answered.
  // Omitted for the admin's preview, which is look-only.
  respondWithToken?: string
}

// The quote exactly as the customer sees it (also used for the admin's draft preview).
export function ProposalDocument({ proposal, respondWithToken }: Props) {
  const { event } = proposal
  const canRespond = proposal.status === PROPOSAL_STATUSES.sent && !proposal.is_expired

  return (
    <article className={CARD}>
      <h1 className="font-display text-4xl md:text-5xl">Hi {proposal.customer_first_name}!</h1>
      <p className="mt-3 text-lg">
        Here’s our proposal for your event. It’s valid until {formatEventDate(proposal.valid_until)}.
      </p>

      <div className="mt-6">
        <StatusNotice proposal={proposal} />
      </div>

      <section aria-labelledby="event-heading" className="mt-8">
        <h2 id="event-heading" className="font-display text-2xl">Your event</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-ink/65">Package</dt>
            <dd>{event.package_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink/65">Guests</dt>
            <dd>{event.guest_count}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink/65">When</dt>
            <dd>
              {formatEventDate(event.event_date)} at {formatEventTime(event.event_start_time)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink/65">Where</dt>
            <dd>{event.venue_address}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink/65">Reference</dt>
            <dd className="font-mono">{event.reference}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="quote-heading" className="mt-8">
        <h2 id="quote-heading" className="font-display text-2xl">Quote</h2>
        <div className="mt-3">
          <ProposalItemsTable items={proposal.items} caption="Items in your quote" />
        </div>
        <div className="mt-5 ml-auto max-w-sm rounded-2xl border-2 border-ink bg-butter-soft p-5">
          <ProposalTotalsTable totals={totalsFromServer(proposal)} audience="customer" />
        </div>
      </section>

      {proposal.message && (
        <section aria-label="Message from us" className="mt-8">
          <blockquote className="border-l-4 border-cherry pl-4 text-lg whitespace-pre-line">{proposal.message}</blockquote>
        </section>
      )}

      {canRespond && respondWithToken && (
        <section aria-label="Your answer" className="mt-10 print:hidden">
          <ProposalResponseActions token={respondWithToken} proposal={proposal} />
        </section>
      )}

      <p className="mt-10 text-ink/75">
        Questions? <ContactLinks business={proposal.business} />
      </p>
    </article>
  )
}
