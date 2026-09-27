import { apiFetch } from '../../lib/api'
import type { BookingFormValues } from './schema'
import type { CreateBookingPayload, CreateBookingResponse } from './types'

const BOOKINGS_PATH = '/bookings'

export function toCreateBookingPayload(values: BookingFormValues): CreateBookingPayload {
  return {
    package_slug: values.packageSlug,
    event_date: values.eventDate,
    event_start_time: values.eventStartTime,
    venue_address: values.venueAddress,
    guest_count: values.guestCount,
    customer_name: values.customerName,
    customer_phone: values.customerPhone,
    customer_email: values.customerEmail,
    customer_notes: values.customerNotes || null,
    website: values.website,
  }
}

export function createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
  return apiFetch<CreateBookingResponse>(BOOKINGS_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
