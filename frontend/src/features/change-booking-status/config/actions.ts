import { BOOKING_STATUSES, type BookingStatus } from '@/entities/booking'

type StatusAction = {
  // Button text, e.g. "Approve".
  label: string
  // Destructive actions ask "are you sure?" first.
  confirm: string | null
  tone: 'primary' | 'neutral' | 'danger'
}

// What moving a booking INTO each status looks like as a button.
export const STATUS_ACTIONS: Record<BookingStatus, StatusAction> = {
  [BOOKING_STATUSES.pending]: { label: 'Move back to pending', confirm: null, tone: 'neutral' },
  [BOOKING_STATUSES.approved]: { label: 'Approve', confirm: null, tone: 'primary' },
  [BOOKING_STATUSES.completed]: { label: 'Mark completed', confirm: null, tone: 'neutral' },
  [BOOKING_STATUSES.declined]: {
    label: 'Decline',
    confirm: 'Decline this booking? This can’t be undone. Let the customer know you can’t make it.',
    tone: 'danger',
  },
  [BOOKING_STATUSES.cancelled]: {
    label: 'Cancel booking',
    confirm: 'Cancel this booking? This can’t be undone. Let the customer know.',
    tone: 'danger',
  },
}
