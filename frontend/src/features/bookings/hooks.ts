import { useMutation } from '@tanstack/react-query'

import { createBooking } from './api'

export function useCreateBooking() {
  return useMutation({ mutationFn: createBooking })
}
