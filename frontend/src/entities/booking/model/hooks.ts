import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { ApiError, HTTP_STATUS } from '@/shared/api'

import { fetchAdminBookings, fetchBooking, fetchBookingSummary } from '../api/adminBookings'
import { BOOKING_SUMMARY_REFRESH_MS } from '../config/bookings'
import type { BookingFilters } from './adminTypes'
import { bookingKeys } from './queryKeys'

const NOT_FOUND = 404

export function useAdminBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => fetchAdminBookings(filters),
    // Keep the current rows on screen while the next page or filter loads.
    placeholderData: keepPreviousData,
  })
}

export function useBooking(bookingId: number) {
  return useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => fetchBooking(bookingId),
    // A missing booking won't appear on retry.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && (error.status === NOT_FOUND || error.status === HTTP_STATUS.forbidden)) &&
      failureCount < 1,
  })
}

export function isBookingNotFound(error: Error | null): boolean {
  return error instanceof ApiError && error.status === NOT_FOUND
}

export function useBookingSummary() {
  return useQuery({
    queryKey: bookingKeys.summary(),
    queryFn: fetchBookingSummary,
    refetchInterval: BOOKING_SUMMARY_REFRESH_MS,
    refetchOnWindowFocus: true,
  })
}
