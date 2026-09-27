import type { CreateBookingPayload } from '@/entities/booking'

import type { BookingFormValues } from '../model/schema'

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
