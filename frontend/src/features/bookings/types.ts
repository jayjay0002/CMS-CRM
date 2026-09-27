// Request/response shapes for POST /bookings (snake_case, matching the FastAPI schemas).
export type CreateBookingPayload = {
  package_slug: string
  event_date: string
  event_start_time: string
  venue_address: string
  guest_count: number
  customer_name: string
  customer_phone: string
  customer_email: string
  customer_notes: string | null
  website: string
}

export type CreateBookingResponse = {
  reference: string
}
