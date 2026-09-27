import { apiFetch } from '@/shared/api'

import { BOOKINGS_PAGE_SIZE } from '../config/bookings'
import type {
  BookingDetail,
  BookingFilters,
  BookingPage,
  BookingStatusChange,
  BookingSummary,
} from '../model/adminTypes'

const ADMIN_BOOKINGS_PATH = '/admin/bookings'
const SUMMARY_PATH = `${ADMIN_BOOKINGS_PATH}/summary`
const FIRST_PAGE = 1

function bookingPath(bookingId: number): string {
  return `${ADMIN_BOOKINGS_PATH}/${bookingId}`
}

export function bookingListQueryString(filters: BookingFilters): string {
  const params = new URLSearchParams({
    timeframe: filters.timeframe,
    limit: String(BOOKINGS_PAGE_SIZE),
    offset: String((Math.max(filters.page, FIRST_PAGE) - FIRST_PAGE) * BOOKINGS_PAGE_SIZE),
  })
  if (filters.status) params.set('status', filters.status)
  const search = filters.search.trim()
  if (search) params.set('q', search)
  return params.toString()
}

export function fetchAdminBookings(filters: BookingFilters): Promise<BookingPage> {
  return apiFetch<BookingPage>(`${ADMIN_BOOKINGS_PATH}?${bookingListQueryString(filters)}`, undefined, {
    auth: true,
  })
}

export function fetchBookingSummary(): Promise<BookingSummary> {
  return apiFetch<BookingSummary>(SUMMARY_PATH, undefined, { auth: true })
}

export function fetchBooking(bookingId: number): Promise<BookingDetail> {
  return apiFetch<BookingDetail>(bookingPath(bookingId), undefined, { auth: true })
}

export function changeBookingStatus(bookingId: number, change: BookingStatusChange): Promise<BookingDetail> {
  return apiFetch<BookingDetail>(
    `${bookingPath(bookingId)}/status`,
    { method: 'POST', body: JSON.stringify(change) },
    { auth: true },
  )
}

export function updateBookingNotes(bookingId: number, adminNotes: string): Promise<BookingDetail> {
  return apiFetch<BookingDetail>(
    bookingPath(bookingId),
    { method: 'PATCH', body: JSON.stringify({ admin_notes: adminNotes }) },
    { auth: true },
  )
}
