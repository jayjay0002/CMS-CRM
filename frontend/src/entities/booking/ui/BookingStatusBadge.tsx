import { BOOKING_STATUS_BADGE_CLASSES, BOOKING_STATUS_LABELS } from '../config/bookings'
import type { BookingStatus } from '../model/adminTypes'

type Props = {
  status: BookingStatus
}

export function BookingStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-bold whitespace-nowrap ${BOOKING_STATUS_BADGE_CLASSES[status]}`}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  )
}
