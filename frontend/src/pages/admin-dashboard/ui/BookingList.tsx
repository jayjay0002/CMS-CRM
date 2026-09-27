import { Link } from 'react-router'

import {
  BookingStatusBadge,
  type BookingListItem,
  formatBookingTimestamp,
  formatEventDate,
  formatEventTime,
} from '@/entities/booking'
import { adminBookingPath } from '@/shared/config'

type Props = {
  bookings: readonly BookingListItem[]
}

const HEADER_CELL = 'px-4 py-3 text-left text-sm font-bold whitespace-nowrap'
const CELL = 'px-4 py-3 align-top'

// Desktop: a table. Phones: stacked cards. Every row opens the booking.
export function BookingList({ bookings }: Props) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border-2 border-ink bg-white md:block">
        <table className="w-full border-collapse">
          <caption className="sr-only">Bookings</caption>
          <thead className="border-b-2 border-ink bg-butter-soft">
            <tr>
              <th scope="col" className={HEADER_CELL}>Reference</th>
              <th scope="col" className={HEADER_CELL}>Customer</th>
              <th scope="col" className={HEADER_CELL}>Package</th>
              <th scope="col" className={HEADER_CELL}>Date</th>
              <th scope="col" className={HEADER_CELL}>Time</th>
              <th scope="col" className={`${HEADER_CELL} text-right`}>Guests</th>
              <th scope="col" className={HEADER_CELL}>Status</th>
              <th scope="col" className={HEADER_CELL}>Requested</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/15">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-butter-soft/50">
                <td className={CELL}>
                  <Link
                    to={adminBookingPath(booking.id)}
                    className="font-mono font-bold underline decoration-cherry decoration-2 underline-offset-4"
                  >
                    {booking.reference}
                  </Link>
                </td>
                <td className={`${CELL} font-semibold`}>{booking.customer_name}</td>
                <td className={CELL}>{booking.package_name}</td>
                <td className={`${CELL} whitespace-nowrap`}>{formatEventDate(booking.event_date)}</td>
                <td className={`${CELL} whitespace-nowrap tabular-nums`}>{formatEventTime(booking.event_start_time)}</td>
                <td className={`${CELL} text-right tabular-nums`}>{booking.guest_count}</td>
                <td className={CELL}>
                  <BookingStatusBadge status={booking.status} />
                </td>
                <td className={`${CELL} text-sm whitespace-nowrap text-ink/70`}>
                  {formatBookingTimestamp(booking.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label="Bookings">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <Link
              to={adminBookingPath(booking.id)}
              className="block rounded-2xl border-2 border-ink bg-white p-4 shadow-sign hover:bg-butter-soft/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{booking.customer_name}</p>
                  <p className="font-mono text-sm text-ink/70">{booking.reference}</p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                <dt className="text-sm font-semibold text-ink/65">Date</dt>
                <dd className="font-semibold">{formatEventDate(booking.event_date)}</dd>
                <dt className="text-sm font-semibold text-ink/65">Time</dt>
                <dd className="font-semibold tabular-nums">{formatEventTime(booking.event_start_time)}</dd>
              </dl>
              <p className="text-sm text-ink/75">
                {booking.package_name}, {booking.guest_count} guests
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
