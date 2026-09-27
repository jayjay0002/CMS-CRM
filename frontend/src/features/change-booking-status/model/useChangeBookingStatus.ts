import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type BookingStatusChange, bookingKeys, changeBookingStatus } from '@/entities/booking'
import { emailLogKeys } from '@/entities/email-log'

export function useChangeBookingStatus(bookingId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (change: BookingStatusChange) => changeBookingStatus(bookingId, change),
    onSuccess: (booking) => {
      queryClient.setQueryData(bookingKeys.detail(bookingId), booking)
      // Lists, filter counts, the nav's pending badge and the email log all depend on status.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: bookingKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: bookingKeys.summary() }),
        queryClient.invalidateQueries({ queryKey: emailLogKeys.forBooking(bookingId) }),
      ])
    },
  })
}
