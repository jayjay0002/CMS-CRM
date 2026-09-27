import { PROPOSAL_STATUSES, type ProposalListItem } from '../model/types'
import { isAwaitingResponse } from './status'

const LOCALE = 'en-US'
const UTC = 'UTC'
const ISO_DATE_LENGTH = 10

// A moment (sent_at, viewed_at...) in the viewer's own calendar: "Sep 28".
const momentFormatter = new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric' })
// A calendar date stored as "YYYY-MM-DD" (valid_until), shown as stored: "Oct 11".
const calendarFormatter = new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric', timeZone: UTC })

function moment(isoTimestamp: string): string {
  return momentFormatter.format(new Date(isoTimestamp))
}

function calendarDate(isoDate: string): string {
  return calendarFormatter.format(new Date(`${isoDate.slice(0, ISO_DATE_LENGTH)}T00:00:00Z`))
}

type Activity = Pick<
  ProposalListItem,
  'status' | 'is_expired' | 'valid_until' | 'sent_at' | 'viewed_at' | 'responded_at'
>

// The latest thing that happened, in a few words: "Viewed Sep 28", "Accepted Sep 29".
export function describeProposalActivity(proposal: Activity): string {
  if (proposal.status === PROPOSAL_STATUSES.draft) return 'Draft, not sent yet'
  if (proposal.responded_at) {
    const verb = proposal.status === PROPOSAL_STATUSES.accepted ? 'Accepted' : 'Declined'
    return `${verb} ${moment(proposal.responded_at)}`
  }
  if (proposal.status === PROPOSAL_STATUSES.sent && !isAwaitingResponse(proposal)) {
    return `Expired ${calendarDate(proposal.valid_until)}`
  }
  if (proposal.viewed_at) return `Viewed ${moment(proposal.viewed_at)}`
  if (proposal.sent_at) return `Sent ${moment(proposal.sent_at)}, not opened yet`
  return 'Sent'
}

// "Valid until" column: "Oct 11".
export function formatValidUntil(isoDate: string): string {
  return calendarDate(isoDate)
}
