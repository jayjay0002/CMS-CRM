import { z } from 'zod'

import { addDaysToIsoDate, todayInBusinessTimezone } from '../../lib/dates'
import {
  MAX_ADDRESS_LENGTH,
  MAX_BOOKING_ADVANCE_DAYS,
  MAX_EMAIL_LENGTH,
  MAX_GUEST_COUNT,
  MAX_NAME_LENGTH,
  MAX_NOTES_LENGTH,
  MIN_ADDRESS_LENGTH,
  MIN_BOOKING_LEAD_DAYS,
  MIN_GUEST_COUNT,
} from './constants'

const PHONE_PATTERN = /^[0-9()+\-.\s]{7,20}$/

export function getEventDateBounds(): { min: string; max: string } {
  const today = todayInBusinessTimezone()
  return {
    min: addDaysToIsoDate(today, MIN_BOOKING_LEAD_DAYS),
    max: addDaysToIsoDate(today, MAX_BOOKING_ADVANCE_DAYS),
  }
}

function isBookableDate(isoDate: string): boolean {
  const { min, max } = getEventDateBounds()
  return isoDate >= min && isoDate <= max
}

export const bookingFormSchema = z.object({
  packageSlug: z.string().min(1, 'Choose a package'),
  eventDate: z
    .string()
    .min(1, 'Pick your event date')
    .refine(isBookableDate, 'Pick a date from tomorrow up to a year from now'),
  eventStartTime: z.string().min(1, 'Pick a start time'),
  venueAddress: z
    .string()
    .trim()
    .min(MIN_ADDRESS_LENGTH, 'Enter the venue address')
    .max(MAX_ADDRESS_LENGTH, 'Shorten the address'),
  guestCount: z
    .number({ error: 'Enter how many guests you expect' })
    .int('Use a whole number')
    .min(MIN_GUEST_COUNT, 'Enter how many guests you expect')
    .max(MAX_GUEST_COUNT, `For more than ${MAX_GUEST_COUNT} guests, call us to plan it`),
  customerName: z.string().trim().min(1, 'Enter your name').max(MAX_NAME_LENGTH, 'Shorten your name'),
  customerPhone: z.string().trim().regex(PHONE_PATTERN, 'Enter a phone number we can call'),
  customerEmail: z.email('Enter an email like you@example.com').max(MAX_EMAIL_LENGTH),
  customerNotes: z.string().trim().max(MAX_NOTES_LENGTH, `Keep notes under ${MAX_NOTES_LENGTH} characters`),
  // Honeypot: hidden from people, filled in by bots. The backend drops requests that include it.
  website: z.string(),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>
