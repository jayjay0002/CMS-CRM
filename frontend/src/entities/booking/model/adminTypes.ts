// Admin booking shapes (snake_case, matching the FastAPI schemas).

export const BOOKING_STATUSES = {
  pending: 'pending',
  approved: 'approved',
  declined: 'declined',
  completed: 'completed',
  cancelled: 'cancelled',
} as const

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES]

export const BOOKING_TIMEFRAMES = {
  // Today onwards, soonest first (the default).
  upcoming: 'upcoming',
  // Before today, most recent first.
  past: 'past',
  // Everything, newest request first.
  all: 'all',
} as const

export type BookingTimeframe = (typeof BOOKING_TIMEFRAMES)[keyof typeof BOOKING_TIMEFRAMES]

export type BookingFilters = {
  timeframe: BookingTimeframe
  status: BookingStatus | null
  search: string
  page: number
}

// GET /admin/bookings items
export type BookingListItem = {
  id: number
  reference: string
  customer_name: string
  package_name: string
  // "YYYY-MM-DD" and "HH:MM:SS", the event's own local date and time.
  event_date: string
  event_start_time: string
  guest_count: number
  status: BookingStatus
  created_at: string
}

export type BookingPage = {
  items: BookingListItem[]
  total: number
  limit: number
  offset: number
}

// GET /admin/bookings/{id}
export type BookingDetail = BookingListItem & {
  // Decimal string, e.g. "450.00".
  package_price: string
  venue_address: string
  customer_phone: string
  customer_email: string
  customer_notes: string | null
  admin_notes: string | null
  status_changed_at: string
  allowed_next_statuses: BookingStatus[]
}

// POST /admin/bookings/{id}/status
export type BookingStatusChange = {
  status: BookingStatus
  // Email the customer about approvals and declines (default on).
  notify_customer: boolean
  // Optional personal note included in the decline email.
  message?: string
}

export type BookingSummary = {
  pending_count: number
}
