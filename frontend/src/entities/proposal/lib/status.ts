import {
  PROPOSAL_DISPLAY_STATUSES,
  PROPOSAL_STATUSES,
  type ProposalDisplayStatus,
  type ProposalStatus,
} from '../model/types'

// "Expired" only applies to a proposal that was sent and never answered.
export function displayStatus(proposal: { status: ProposalStatus; is_expired: boolean }): ProposalDisplayStatus {
  if (proposal.status === PROPOSAL_STATUSES.sent && proposal.is_expired) return PROPOSAL_DISPLAY_STATUSES.expired
  return proposal.status
}

export function isDraft(proposal: { status: ProposalStatus }): boolean {
  return proposal.status === PROPOSAL_STATUSES.draft
}

// The customer can still accept or decline.
export function isAwaitingResponse(proposal: { status: ProposalStatus; is_expired: boolean }): boolean {
  return proposal.status === PROPOSAL_STATUSES.sent && !proposal.is_expired
}
