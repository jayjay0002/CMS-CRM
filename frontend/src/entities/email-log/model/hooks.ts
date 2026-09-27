import { useQuery } from '@tanstack/react-query'

import { fetchBookingEmails } from '../api/emailLogApi'
import { emailLogKeys } from './queryKeys'

// Emails go out in the background after an action, so check again shortly after.
const EMAIL_LOG_REFRESH_MS = 15_000

export function useBookingEmails(bookingId: number) {
  return useQuery({
    queryKey: emailLogKeys.forBooking(bookingId),
    queryFn: () => fetchBookingEmails(bookingId),
    refetchInterval: EMAIL_LOG_REFRESH_MS,
  })
}
