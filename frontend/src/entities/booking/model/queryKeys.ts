import type { BookingFilters } from './adminTypes'

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: BookingFilters) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (bookingId: number) => [...bookingKeys.details(), bookingId] as const,
  summary: () => [...bookingKeys.all, 'summary'] as const,
}
