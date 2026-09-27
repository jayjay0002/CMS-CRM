import { Link, useNavigate } from 'react-router'

import { type BookingDetail, formatBookingTimestamp, formatEventDate } from '@/entities/booking'
import {
  type AdminProposal,
  ProposalItemsTable,
  ProposalTotalsTable,
  totalsFromServer,
} from '@/entities/proposal'
import { useDuplicateProposal } from '@/features/create-proposal'
import { saveErrorMessage } from '@/shared/api'
import { adminBookingPath, adminProposalPath } from '@/shared/config'
import { CopyButton, FormMessage, MenuButton } from '@/shared/ui'

import { ActionBar } from './ActionBar'
import { BookingContextCard } from './BookingContextCard'
import { PreviewPane } from './PreviewPane'
import { Workspace } from './Workspace'

const COPY_BUTTON =
  'rounded-full border-2 border-ink bg-white px-4 py-2 font-semibold whitespace-nowrap hover:bg-butter-soft'
const LINK = 'font-semibold underline decoration-cherry decoration-2 underline-offset-4'

function activity(proposal: AdminProposal): string[] {
  const facts = [
    proposal.sent_at && `Sent ${formatBookingTimestamp(proposal.sent_at)}`,
    proposal.viewed_at ? `Viewed ${formatBookingTimestamp(proposal.viewed_at)}` : proposal.sent_at && 'Not opened yet',
    proposal.responded_at && `Answered ${formatBookingTimestamp(proposal.responded_at)}`,
  ]
  return facts.filter((fact): fact is string => Boolean(fact))
}

type Props = {
  proposal: AdminProposal
  booking: BookingDetail | undefined
  // Set right after sending from this screen, to confirm it.
  sentTo: string | null
}

// Sent, accepted or declined: nothing to edit, but it can be shared or copied into a new draft.
export function ReadOnlyWorkspace({ proposal, booking, sentTo }: Props) {
  const navigate = useNavigate()
  const duplicate = useDuplicateProposal()
  const bookingPath = adminBookingPath(proposal.booking_id)
  const duplicateDraft = () =>
    duplicate.mutate(proposal.id, { onSuccess: (copy) => navigate(adminProposalPath(copy.id)) })

  return (
    <Workspace
      editLabel="Details"
      bar={
        <ActionBar
          proposal={proposal}
          bookingPath={bookingPath}
          bookingReference={booking?.reference ?? null}
          onBack={() => undefined}
          status={<span className="text-sm text-ink/70">{activity(proposal).join(' · ')}</span>}
          actions={
            <>
              <CopyButton text={proposal.public_url} label="Copy customer link" className={COPY_BUTTON} />
              <MenuButton
                label="More actions"
                items={[
                  { label: duplicate.isPending ? 'Copying…' : 'Duplicate as new draft', onSelect: duplicateDraft },
                  { label: 'Open customer page', href: proposal.public_url, onSelect: () => undefined },
                ]}
              />
            </>
          }
        />
      }
      panel={
        <>
          {sentTo && (
            <div className="space-y-2">
              <FormMessage tone="success">Sent to {sentTo}.</FormMessage>
              <p className="text-sm text-ink/75">
                You can also share the link yourself (text, Messenger, WhatsApp).{' '}
                <Link to={bookingPath} className={LINK}>
                  Back to booking
                </Link>
              </p>
            </div>
          )}
          {duplicate.isError && <FormMessage tone="error">{saveErrorMessage(duplicate.error)}</FormMessage>}
          <BookingContextCard booking={booking} />
          <section aria-labelledby="quote-heading" className="space-y-3">
            <h2 id="quote-heading" className="font-display text-xl">
              Quote
            </h2>
            <ProposalItemsTable items={proposal.items} caption="Proposal items" />
            <p className="text-sm text-ink/75">Valid until {formatEventDate(proposal.valid_until)}.</p>
            {proposal.message && (
              <blockquote className="border-l-4 border-butter pl-4 whitespace-pre-line">{proposal.message}</blockquote>
            )}
            {proposal.decline_reason && (
              <p>
                <span className="font-semibold">Customer’s reason for declining:</span> {proposal.decline_reason}
              </p>
            )}
          </section>
          <p className="text-sm text-ink/70">
            Sent proposals can’t be edited. Need changes? Use “Duplicate as new draft” in the ⋯ menu.
          </p>
        </>
      }
      panelFooter={<ProposalTotalsTable totals={totalsFromServer(proposal)} />}
      preview={<PreviewPane proposal={proposal} booking={booking} label="What the customer sees" />}
    />
  )
}
