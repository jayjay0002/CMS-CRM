import {
  BOOKING_STATUSES,
  BOOKING_TIMEFRAMES,
  type BookingStatus,
  type BookingTimeframe,
} from '../model/adminTypes'

// Matches the backend's page size default.
export const BOOKINGS_PAGE_SIZE = 20
export const ADMIN_NOTES_MAX_LENGTH = 2000
export const BOOKING_SEARCH_MAX_LENGTH = 100
// Personal message in the decline email.
export const STATUS_MESSAGE_MAX_LENGTH = 1000
// Keep the nav's pending badge fresh while the admin panel is open.
export const BOOKING_SUMMARY_REFRESH_MS = 60_000

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BOOKING_STATUSES.pending]: 'Pending',
  [BOOKING_STATUSES.approved]: 'Approved',
  [BOOKING_STATUSES.declined]: 'Declined',
  [BOOKING_STATUSES.completed]: 'Completed',
  [BOOKING_STATUSES.cancelled]: 'Cancelled',
}

// Pending needs attention, so it's the loudest; final states quiet down.
export const BOOKING_STATUS_BADGE_CLASSES: Record<BookingStatus, string> = {
  [BOOKING_STATUSES.pending]: 'border-2 border-ink bg-butter text-ink',
  [BOOKING_STATUSES.approved]: 'border-2 border-ink bg-ink text-kernel',
  [BOOKING_STATUSES.declined]: 'border-2 border-dashed border-cherry-deep/60 bg-white text-cherry-deep',
  [BOOKING_STATUSES.completed]: 'border-2 border-ink/20 bg-butter-soft text-ink/80',
  [BOOKING_STATUSES.cancelled]: 'border-2 border-dashed border-ink/40 bg-white text-ink/60 line-through',
}

// Order used for filter chips.
export const BOOKING_STATUS_ORDER: readonly BookingStatus[] = [
  BOOKING_STATUSES.pending,
  BOOKING_STATUSES.approved,
  BOOKING_STATUSES.completed,
  BOOKING_STATUSES.declined,
  BOOKING_STATUSES.cancelled,
]

export const BOOKING_TIMEFRAME_LABELS: Record<BookingTimeframe, string> = {
  [BOOKING_TIMEFRAMES.upcoming]: 'Upcoming',
  [BOOKING_TIMEFRAMES.past]: 'Past',
  [BOOKING_TIMEFRAMES.all]: 'All',
}

export const BOOKING_TIMEFRAME_ORDER: readonly BookingTimeframe[] = [
  BOOKING_TIMEFRAMES.upcoming,
  BOOKING_TIMEFRAMES.past,
  BOOKING_TIMEFRAMES.all,
]

export function isBookingStatus(value: string | null): value is BookingStatus {
  return value !== null && Object.values<string>(BOOKING_STATUSES).includes(value)
}

export function isBookingTimeframe(value: string | null): value is BookingTimeframe {
  return value !== null && Object.values<string>(BOOKING_TIMEFRAMES).includes(value)
}
