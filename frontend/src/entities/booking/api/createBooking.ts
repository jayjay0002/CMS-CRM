import { apiFetch } from '@/shared/api'

import type { CreateBookingPayload, CreateBookingResponse } from '../model/types'

const BOOKINGS_PATH = '/bookings'

export function createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
  return apiFetch<CreateBookingResponse>(BOOKINGS_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
