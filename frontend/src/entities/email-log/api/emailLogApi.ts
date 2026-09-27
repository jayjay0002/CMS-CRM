import { apiFetch } from '@/shared/api'

import type { EmailLogEntry } from '../model/types'

export function fetchBookingEmails(bookingId: number): Promise<EmailLogEntry[]> {
  return apiFetch<EmailLogEntry[]>(`/admin/bookings/${bookingId}/emails`, undefined, { auth: true })
}
