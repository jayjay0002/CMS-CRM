import { useMutation, useQueryClient } from '@tanstack/react-query'

import { bookingKeys, updateBookingNotes } from '@/entities/booking'

export function useUpdateBookingNotes(bookingId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (adminNotes: string) => updateBookingNotes(bookingId, adminNotes),
    onSuccess: (booking) => queryClient.setQueryData(bookingKeys.detail(bookingId), booking),
  })
}
