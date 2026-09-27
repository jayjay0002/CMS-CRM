import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'

import {
  type BookingDetail,
  BookingStatusBadge,
  formatBookingTimestamp,
  formatEventDate,
  formatEventTime,
  googleMapsSearchUrl,
  isBookingNotFound,
  useBooking,
} from '@/entities/booking'
import { BookingStatusActions } from '@/features/change-booking-status'
import { AdminNotesForm } from '@/features/edit-admin-notes'
import { ROUTES } from '@/shared/config'
import { formatPrice, mailtoHref } from '@/shared/lib'

const CARD = 'rounded-3xl border-4 border-ink bg-white p-6 shadow-sign md:p-8'
const LINK = 'font-semibold underline decoration-cherry decoration-2 underline-offset-4'
const RETRY_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-1.5 font-semibold hover:bg-butter-soft'

// Customers type phone numbers freely; keep digits and a leading + for tap-to-call.
function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

function BackLink() {
  return (
    <Link to={ROUTES.admin} className={LINK}>
      ← All bookings
    </Link>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-ink/65">{label}</dt>
      <dd className="mt-0.5 text-lg">{children}</dd>
    </div>
  )
}

function BookingView({ booking }: { booking: BookingDetail }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          <span className="sr-only">Booking </span>
          <span className="font-mono">{booking.reference}</span>
        </h1>
        <BookingStatusBadge status={booking.status} />
      </div>
      <p className="text-ink/70">
        Requested {formatBookingTimestamp(booking.created_at)}. Status last changed{' '}
        {formatBookingTimestamp(booking.status_changed_at)}.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="event-heading" className={CARD}>
          <h2 id="event-heading" className="font-display text-2xl">Event</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Detail label="Package">
              {booking.package_name}
              <span className="block text-base text-ink/70">
                {formatPrice(Number(booking.package_price))} at booking time
              </span>
            </Detail>
            <Detail label="Guests">{booking.guest_count}</Detail>
            <Detail label="Date">{formatEventDate(booking.event_date)}</Detail>
            <Detail label="Start time">{formatEventTime(booking.event_start_time)}</Detail>
            <div className="sm:col-span-2">
              <Detail label="Venue">
                {booking.venue_address}
                <a
                  href={googleMapsSearchUrl(booking.venue_address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${LINK} mt-1 block text-base`}
                >
                  Open in Google Maps<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Detail>
            </div>
          </dl>
        </section>

        <section aria-labelledby="customer-heading" className={CARD}>
          <h2 id="customer-heading" className="font-display text-2xl">Customer</h2>
          <dl className="mt-5 grid gap-4">
            <Detail label="Name">{booking.customer_name}</Detail>
            <Detail label="Phone">
              <a href={phoneHref(booking.customer_phone)} className={LINK}>
                {booking.customer_phone}
              </a>
            </Detail>
            <Detail label="Email">
              <a href={mailtoHref(booking.customer_email)} className={`${LINK} break-all`}>
                {booking.customer_email}
              </a>
            </Detail>
            <Detail label="Their notes">
              {booking.customer_notes ? (
                <span className="whitespace-pre-line">{booking.customer_notes}</span>
              ) : (
                <span className="text-ink/60">No notes</span>
              )}
            </Detail>
          </dl>
        </section>
      </div>

      <section aria-labelledby="status-heading" className={CARD}>
        <h2 id="status-heading" className="font-display text-2xl">Status</h2>
        <div className="mt-4">
          <BookingStatusActions booking={booking} />
        </div>
      </section>

      <section aria-labelledby="notes-heading" className={CARD}>
        <h2 id="notes-heading" className="font-display text-2xl">Notes</h2>
        <div className="mt-4">
          {/* Keyed by booking so switching bookings never shows another booking's draft. */}
          <AdminNotesForm key={booking.id} booking={booking} />
        </div>
      </section>
    </div>
  )
}

export function AdminBookingPage() {
  const { bookingId } = useParams()
  const id = Number(bookingId)
  const booking = useBooking(id)

  function renderBody() {
    if (!Number.isInteger(id) || isBookingNotFound(booking.error)) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-ink/40 p-8">
          <h1 className="font-display text-3xl">Booking not found</h1>
          <p className="mt-2 text-ink/75">It may have been removed, or the link is wrong.</p>
        </div>
      )
    }
    if (booking.isPending) {
      return (
        <div role="status" className="space-y-3">
          <span className="sr-only">Loading booking…</span>
          <div className="h-10 w-64 animate-pulse rounded-full bg-ink/10" />
          <div className="h-64 animate-pulse rounded-3xl bg-ink/10" />
        </div>
      )
    }
    if (booking.isError) {
      return (
        <div role="alert" className="space-y-3 rounded-2xl border-2 border-cherry bg-cherry/5 p-6">
          <p className="font-semibold">We couldn’t load this booking.</p>
          <button type="button" onClick={() => booking.refetch()} className={RETRY_BUTTON}>
            Try again
          </button>
        </div>
      )
    }
    return <BookingView booking={booking.data} />
  }

  return (
    <section className="space-y-6">
      <BackLink />
      {renderBody()}
    </section>
  )
}
