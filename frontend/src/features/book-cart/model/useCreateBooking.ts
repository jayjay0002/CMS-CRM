import { useMutation } from '@tanstack/react-query'

import { createBooking } from '@/entities/booking'

export function useCreateBooking() {
  return useMutation({ mutationFn: createBooking })
}
