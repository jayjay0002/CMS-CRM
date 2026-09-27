import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type BookingStatus, bookingKeys, changeBookingStatus } from '@/entities/booking'

export function useChangeBookingStatus(bookingId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: BookingStatus) => changeBookingStatus(bookingId, status),
    onSuccess: (booking) => {
      queryClient.setQueryData(bookingKeys.detail(bookingId), booking)
      // Lists, filter counts and the nav's pending badge all depend on status.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: bookingKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: bookingKeys.summary() }),
      ])
    },
  })
}
