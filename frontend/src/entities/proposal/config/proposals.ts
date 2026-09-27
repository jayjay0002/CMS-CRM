import {
  PROPOSAL_DISPLAY_STATUSES,
  PROPOSAL_LIST_FILTERS,
  type ProposalDisplayStatus,
  type ProposalListFilter,
} from '../model/types'

// Mirrors the backend limits in app/modules/proposals.
export const PROPOSAL_LIMITS = {
  maxItems: 50,
  descriptionMaxLength: 200,
  minQuantity: 1,
  maxQuantity: 1000,
  messageMaxLength: 2000,
  declineReasonMaxLength: 1000,
} as const

export const PROPOSAL_STATUS_LABELS: Record<ProposalDisplayStatus, string> = {
  [PROPOSAL_DISPLAY_STATUSES.draft]: 'Draft',
  [PROPOSAL_DISPLAY_STATUSES.sent]: 'Sent',
  [PROPOSAL_DISPLAY_STATUSES.accepted]: 'Accepted',
  [PROPOSAL_DISPLAY_STATUSES.declined]: 'Declined',
  [PROPOSAL_DISPLAY_STATUSES.expired]: 'Expired',
}

// Accepted is the win, so it's the loudest; drafts and closed-out states stay quiet.
export const PROPOSAL_STATUS_BADGE_CLASSES: Record<ProposalDisplayStatus, string> = {
  [PROPOSAL_DISPLAY_STATUSES.draft]: 'border-2 border-dashed border-ink/50 bg-white text-ink/80',
  [PROPOSAL_DISPLAY_STATUSES.sent]: 'border-2 border-ink bg-butter text-ink',
  [PROPOSAL_DISPLAY_STATUSES.accepted]: 'border-2 border-ink bg-ink text-kernel',
  [PROPOSAL_DISPLAY_STATUSES.declined]: 'border-2 border-dashed border-cherry-deep/60 bg-white text-cherry-deep',
  [PROPOSAL_DISPLAY_STATUSES.expired]: 'border-2 border-dashed border-ink/40 bg-white text-ink/60',
}

// --- Proposals list ---

// Matches the backend's page size default.
export const PROPOSALS_PAGE_SIZE = 20
export const PROPOSAL_SEARCH_MAX_LENGTH = 100
// Keep the nav's "awaiting reply" badge fresh while the admin panel is open.
export const PROPOSAL_SUMMARY_REFRESH_MS = 60_000

export const PROPOSAL_LIST_FILTER_LABELS: Record<ProposalListFilter, string> = {
  [PROPOSAL_LIST_FILTERS.all]: 'All',
  [PROPOSAL_LIST_FILTERS.draft]: 'Drafts',
  [PROPOSAL_LIST_FILTERS.awaiting]: 'Awaiting reply',
  [PROPOSAL_LIST_FILTERS.accepted]: 'Accepted',
  [PROPOSAL_LIST_FILTERS.declined]: 'Declined',
  [PROPOSAL_LIST_FILTERS.expired]: 'Expired',
}

export const PROPOSAL_LIST_FILTER_ORDER: readonly ProposalListFilter[] = [
  PROPOSAL_LIST_FILTERS.all,
  PROPOSAL_LIST_FILTERS.awaiting,
  PROPOSAL_LIST_FILTERS.draft,
  PROPOSAL_LIST_FILTERS.accepted,
  PROPOSAL_LIST_FILTERS.declined,
  PROPOSAL_LIST_FILTERS.expired,
]

export function isProposalListFilter(value: string | null): value is ProposalListFilter {
  return value !== null && Object.values<string>(PROPOSAL_LIST_FILTERS).includes(value)
}
