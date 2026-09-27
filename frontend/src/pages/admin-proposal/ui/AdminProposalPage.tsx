import { type MouseEvent, type ReactNode, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { type BookingDetail, formatBookingTimestamp, formatEventDate, useBooking } from '@/entities/booking'
import {
  type AdminProposal,
  isDraft,
  isProposalNotFound,
  ProposalItemsTable,
  ProposalStatusBadge,
  ProposalTotalsTable,
  totalsFromServer,
  useProposal,
} from '@/entities/proposal'
import { useSite } from '@/entities/site'
import { DuplicateProposalButton } from '@/features/create-proposal'
import { DeleteProposalButton } from '@/features/delete-proposal'
import { ProposalForm } from '@/features/edit-proposal'
import { SendProposalPanel } from '@/features/send-proposal'
import { adminBookingPath, ROUTES } from '@/shared/config'
import { buttonClasses, CopyLinkField, FormMessage } from '@/shared/ui'
import { draftAsCustomerSees, ProposalDocument } from '@/widgets/proposal-document'

import { useLeaveGuard } from '../lib/useLeaveGuard'

const CARD = 'rounded-3xl border-4 border-ink bg-white p-6 shadow-sign md:p-8'
const LINK = 'font-semibold underline decoration-cherry decoration-2 underline-offset-4'
const RETRY_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-1.5 font-semibold hover:bg-butter-soft'
const STAY_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-2 font-semibold hover:bg-butter-soft'
const TOGGLE_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-2 font-semibold hover:bg-butter-soft'

type GuardLink = (target: string) => (event: MouseEvent<HTMLAnchorElement>) => void

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={CARD}>
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Timestamps({ proposal }: { proposal: AdminProposal }) {
  const facts = [
    proposal.sent_at && `Sent ${formatBookingTimestamp(proposal.sent_at)}`,
    proposal.viewed_at ? `Viewed ${formatBookingTimestamp(proposal.viewed_at)}` : proposal.sent_at && 'Not viewed yet',
    proposal.responded_at && `Answered ${formatBookingTimestamp(proposal.responded_at)}`,
  ].filter(Boolean)
  if (facts.length === 0) return null
  return <p className="text-ink/70">{facts.join(' · ')}</p>
}

// The saved draft as the customer will see it once sent (drafts have no public page yet).
function CustomerPreview({ proposal, booking }: { proposal: AdminProposal; booking: BookingDetail | undefined }) {
  const [isOpen, setIsOpen] = useState(false)
  const settings = useSite().data?.settings

  return (
    <div className="space-y-4">
      <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)} className={TOGGLE_BUTTON}>
        {isOpen ? 'Hide customer preview' : 'Preview what the customer sees'}
      </button>
      {isOpen &&
        (booking && settings ? (
          <div className="space-y-2">
            <p className="text-sm text-ink/70">Showing the last saved version. Save to see new changes here.</p>
            <div className="rounded-3xl border-2 border-dashed border-ink/40 bg-kernel p-3 md:p-6">
              <ProposalDocument proposal={draftAsCustomerSees(proposal, booking, settings)} />
            </div>
          </div>
        ) : (
          <p role="status">Loading preview…</p>
        ))}
    </div>
  )
}

function ReadOnlyProposal({ proposal, sentTo }: { proposal: AdminProposal; sentTo: string | null }) {
  return (
    <div className="space-y-6">
      <Section title="Quote">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <ProposalItemsTable items={proposal.items} caption="Proposal items" />
          <div className="rounded-2xl border-2 border-ink/20 bg-butter-soft p-4">
            <ProposalTotalsTable totals={totalsFromServer(proposal)} />
          </div>
        </div>
        <p className="mt-4 text-ink/75">Valid until {formatEventDate(proposal.valid_until)}.</p>
        {proposal.message && (
          <blockquote className="mt-3 border-l-4 border-butter pl-4 whitespace-pre-line">{proposal.message}</blockquote>
        )}
        {proposal.decline_reason && (
          <p className="mt-3">
            <span className="font-semibold">Customer’s reason for declining:</span> {proposal.decline_reason}
          </p>
        )}
      </Section>
      <Section title="Share">
        {sentTo && (
          <div className="mb-4">
            <FormMessage tone="success">Proposal sent to {sentTo}.</FormMessage>
          </div>
        )}
        <p className="mb-3 text-ink/75">
          The customer’s link to this proposal. You can also share it yourself (text, Messenger, WhatsApp); anyone
          with it can view and answer the proposal.
        </p>
        <CopyLinkField link={proposal.public_url} label="Proposal link" />
        <a href={proposal.public_url} target="_blank" rel="noopener noreferrer" className={LINK}>
          Open the customer’s page<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <p className="mt-5 text-ink/75">Sent proposals can’t be edited. Need changes? Start a copy.</p>
        <div className="mt-3">
          <DuplicateProposalButton
            proposalId={proposal.id}
            label="Duplicate as new draft"
            className={buttonClasses('primary', 'px-5 py-2.5')}
          />
        </div>
      </Section>
    </div>
  )
}

type DraftProps = {
  proposal: AdminProposal
  booking: BookingDetail | undefined
  customerEmail: string
  isDirty: boolean
  onDirtyChange: (isDirty: boolean) => void
  onSent: () => void
}

function DraftProposal({ proposal, booking, customerEmail, isDirty, onDirtyChange, onSent }: DraftProps) {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <section className={CARD}>
        <ProposalForm proposal={proposal} onDirtyChange={onDirtyChange} />
      </section>
      <Section title="Send">
        <div className="space-y-5">
          <SendProposalPanel
            proposal={proposal}
            customerEmail={customerEmail}
            hasUnsavedChanges={isDirty}
            onSent={onSent}
          />
          <CustomerPreview proposal={proposal} booking={booking} />
          <div className="border-t-2 border-ink/10 pt-4">
            <DeleteProposalButton proposal={proposal} onDeleted={() => navigate(adminBookingPath(proposal.booking_id))} />
          </div>
        </div>
      </Section>
    </div>
  )
}

type ViewProps = {
  proposal: AdminProposal
  isDirty: boolean
  setIsDirty: (isDirty: boolean) => void
  guardLink: GuardLink
}

function ProposalView({ proposal, isDirty, setIsDirty, guardLink }: ViewProps) {
  const booking = useBooking(proposal.booking_id)
  const bookingPath = adminBookingPath(proposal.booking_id)
  const reference = booking.data?.reference ?? 'booking'
  const customerEmail = booking.data?.customer_email ?? 'the customer'
  // Set when this proposal was sent from this screen, to confirm it on the read-only view.
  const [sentTo, setSentTo] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <Link to={bookingPath} onClick={guardLink(bookingPath)} className={LINK}>
        ← Back to {reference}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          Proposal <span className="font-mono text-2xl md:text-3xl">for {reference}</span>
        </h1>
        <ProposalStatusBadge proposal={proposal} />
      </div>
      {booking.data && (
        <p className="text-ink/75">
          {booking.data.customer_name} · {booking.data.package_name} · {formatEventDate(booking.data.event_date)}
        </p>
      )}
      <Timestamps proposal={proposal} />
      {isDraft(proposal) ? (
        <DraftProposal
          // Re-mount the form when a different proposal loads so no stale values linger.
          key={proposal.id}
          proposal={proposal}
          booking={booking.data}
          customerEmail={customerEmail}
          isDirty={isDirty}
          onDirtyChange={setIsDirty}
          onSent={() => setSentTo(customerEmail)}
        />
      ) : (
        <ReadOnlyProposal proposal={proposal} sentTo={sentTo} />
      )}
    </div>
  )
}

export function AdminProposalPage() {
  const { proposalId } = useParams()
  const id = Number(proposalId)
  const proposal = useProposal(id)
  const [isDirty, setIsDirty] = useState(false)
  const { pendingTarget, guardLink, leave, stay } = useLeaveGuard(isDirty)

  function renderBody() {
    if (!Number.isInteger(id) || isProposalNotFound(proposal.error)) {
      return (
        <div className="space-y-3 rounded-2xl border-2 border-dashed border-ink/40 p-8">
          <h1 className="font-display text-3xl">Proposal not found</h1>
          <p className="text-ink/75">It may have been deleted, or the link is wrong.</p>
          <Link to={ROUTES.admin} className={LINK}>
            ← All bookings
          </Link>
        </div>
      )
    }
    if (proposal.isPending) {
      return (
        <div role="status" className="space-y-3">
          <span className="sr-only">Loading proposal…</span>
          <div className="h-10 w-72 animate-pulse rounded-full bg-ink/10" />
          <div className="h-80 animate-pulse rounded-3xl bg-ink/10" />
        </div>
      )
    }
    if (proposal.isError) {
      return (
        <div role="alert" className="space-y-3 rounded-2xl border-2 border-cherry bg-cherry/5 p-6">
          <p className="font-semibold">We couldn’t load this proposal.</p>
          <button type="button" onClick={() => proposal.refetch()} className={RETRY_BUTTON}>
            Try again
          </button>
        </div>
      )
    }
    return <ProposalView proposal={proposal.data} isDirty={isDirty} setIsDirty={setIsDirty} guardLink={guardLink} />
  }

  return (
    <section className="space-y-6">
      {pendingTarget && (
        <div role="alertdialog" aria-label="Unsaved changes" className="rounded-2xl border-2 border-cherry-deep bg-cherry/5 p-4">
          <p className="font-semibold">You have unsaved changes. Leave without saving?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={leave} className={buttonClasses('primary', 'px-4 py-2')}>
              Leave without saving
            </button>
            <button type="button" onClick={stay} className={STAY_BUTTON}>
              Keep editing
            </button>
          </div>
        </div>
      )}
      {renderBody()}
    </section>
  )
}
