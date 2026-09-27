import { BOOKING_STATUSES, type BookingStatus } from '@/entities/booking'

type StatusAction = {
  // Button text, e.g. "Approve".
  label: string
  // Destructive actions ask "are you sure?" first.
  confirm: string | null
  tone: 'primary' | 'neutral' | 'danger'
  // The server emails the customer about this change (when "Email the customer" is on).
  emailsCustomer: boolean
  // The confirm step offers a personal message for the customer's email.
  offersMessage: boolean
}

// What moving a booking INTO each status looks like as a button.
export const STATUS_ACTIONS: Record<BookingStatus, StatusAction> = {
  [BOOKING_STATUSES.pending]: {
    label: 'Move back to pending',
    confirm: null,
    tone: 'neutral',
    emailsCustomer: false,
    offersMessage: false,
  },
  [BOOKING_STATUSES.approved]: {
    label: 'Approve',
    confirm: null,
    tone: 'primary',
    emailsCustomer: true,
    offersMessage: false,
  },
  [BOOKING_STATUSES.completed]: {
    label: 'Mark completed',
    confirm: null,
    tone: 'neutral',
    emailsCustomer: false,
    offersMessage: false,
  },
  [BOOKING_STATUSES.declined]: {
    label: 'Decline',
    confirm: 'Decline this booking? This can’t be undone.',
    tone: 'danger',
    emailsCustomer: true,
    offersMessage: true,
  },
  [BOOKING_STATUSES.cancelled]: {
    label: 'Cancel booking',
    confirm: 'Cancel this booking? This can’t be undone. Let the customer know.',
    tone: 'danger',
    emailsCustomer: false,
    offersMessage: false,
  },
}
