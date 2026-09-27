import { type BookingDetail, formatEventDate, formatEventTime } from '@/entities/booking'

type Props = {
  booking: BookingDetail | undefined
}

// Who and what the proposal is for, kept small so the quote gets the space.
export function BookingContextCard({ booking }: Props) {
  if (!booking) {
    return (
      <div role="status" className="h-28 animate-pulse rounded-2xl bg-ink/10">
        <span className="sr-only">Loading booking…</span>
      </div>
    )
  }

  return (
    <section aria-label="Booking" className="rounded-2xl border-2 border-ink/20 bg-butter-soft/60 p-4 text-sm">
      <p className="text-base font-bold">{booking.customer_name}</p>
      <p className="text-ink/75">
        {booking.package_name} · {booking.guest_count} guests
      </p>
      <p className="mt-1">
        {formatEventDate(booking.event_date)} at {formatEventTime(booking.event_start_time)}
      </p>
      <p className="text-ink/75">{booking.venue_address}</p>
      <p className="mt-2 text-ink/75">
        Sends to <span className="font-semibold text-ink">{booking.customer_email}</span>
      </p>
    </section>
  )
}
