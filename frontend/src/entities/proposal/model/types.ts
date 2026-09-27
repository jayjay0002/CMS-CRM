// Proposal shapes (snake_case, matching the FastAPI schemas in app/modules/proposals).
// Money is sent and received as decimal strings ("450.00"); see lib/money.ts.

export const PROPOSAL_STATUSES = {
  draft: 'draft',
  sent: 'sent',
  accepted: 'accepted',
  declined: 'declined',
} as const

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[keyof typeof PROPOSAL_STATUSES]

// What the admin and customer see: "Expired" is derived (sent + past valid_until), never stored.
export const PROPOSAL_DISPLAY_STATUSES = {
  ...PROPOSAL_STATUSES,
  expired: 'expired',
} as const

export type ProposalDisplayStatus = (typeof PROPOSAL_DISPLAY_STATUSES)[keyof typeof PROPOSAL_DISPLAY_STATUSES]

// What the admin sends for each line (PUT).
export type ProposalItem = {
  description: string
  quantity: number
  // Decimal string, e.g. "12.50".
  unit_price: string
}

// What the server returns for each line: the same plus its computed amount.
export type ProposalItemRead = ProposalItem & {
  line_total: string
}

// Totals are computed by the server (authoritative) and returned as decimal strings.
export type ProposalTotals = {
  subtotal: string
  discount: string
  total: string
  deposit: string
  balance: string
}

// GET /admin/bookings/{id}/proposals items and GET /admin/proposals/{id} (same shape).
export type AdminProposal = ProposalTotals & {
  id: number
  booking_id: number
  status: ProposalStatus
  is_expired: boolean
  // The customer's link. Only works once the proposal is sent (drafts aren't public).
  public_url: string
  message: string | null
  valid_until: string
  items: ProposalItemRead[]
  sent_at: string | null
  viewed_at: string | null
  responded_at: string | null
  decline_reason: string | null
  created_at: string
}

// PUT /admin/proposals/{id} (drafts only)
export type ProposalDraftInput = {
  items: ProposalItem[]
  discount: string
  deposit: string
  valid_until: string
  message: string | null
}

// GET /proposals/{token}: what the customer sees (no internal ids or admin notes).
// Drafts aren't public (404 until sent).
export type PublicProposal = ProposalTotals & {
  status: ProposalStatus
  is_expired: boolean
  valid_until: string
  message: string | null
  responded_at: string | null
  decline_reason: string | null
  business: {
    name: string
    phone_display: string
    phone_e164: string
    email: string | null
  }
  customer_first_name: string
  event: {
    reference: string
    package_name: string
    event_date: string
    event_start_time: string
    venue_address: string
    guest_count: number
  }
  items: ProposalItem[]
}

// --- Admin list of every proposal (GET /admin/proposals) ---

// Tabs on the Proposals list. "awaiting" = sent, not expired, no answer yet.
export const PROPOSAL_LIST_FILTERS = {
  all: 'all',
  draft: 'draft',
  awaiting: 'awaiting',
  accepted: 'accepted',
  declined: 'declined',
  expired: 'expired',
} as const

export type ProposalListFilter = (typeof PROPOSAL_LIST_FILTERS)[keyof typeof PROPOSAL_LIST_FILTERS]

export type ProposalListItem = {
  id: number
  booking_id: number
  booking_reference: string
  customer_name: string
  // Event's own local date, "YYYY-MM-DD".
  event_date: string
  status: ProposalStatus
  is_expired: boolean
  total: string
  deposit: string
  valid_until: string
  sent_at: string | null
  viewed_at: string | null
  responded_at: string | null
  created_at: string
}

export type ProposalPage = {
  items: ProposalListItem[]
  total: number
  limit: number
  offset: number
}

export type ProposalListFilters = {
  filter: ProposalListFilter
  search: string
  // 1-based.
  page: number
}

export type ProposalSummary = {
  awaiting_count: number
}
