// Mirrors the backend booking rules (see docs/superpowers/specs/2026-09-27-foundation-design.md).
export const MIN_BOOKING_LEAD_DAYS = 1
export const MAX_BOOKING_ADVANCE_DAYS = 365

export const MIN_GUEST_COUNT = 1
export const MAX_GUEST_COUNT = 1000

export const MIN_ADDRESS_LENGTH = 5
export const MAX_ADDRESS_LENGTH = 500
export const MAX_NAME_LENGTH = 120
export const MAX_EMAIL_LENGTH = 255
export const MAX_NOTES_LENGTH = 1000

// Start times snap to quarter hours.
export const START_TIME_STEP_SECONDS = 900

// The form reads top to bottom in the order people plan an event; numbered so the path is clear.
export const BOOKING_STEPS = {
  package: { number: 1, title: 'Pick a package' },
  event: { number: 2, title: 'Your event' },
  location: { number: 3, title: 'Where' },
  contact: { number: 4, title: 'How we reach you' },
} as const

export type BookingStep = (typeof BOOKING_STEPS)[keyof typeof BOOKING_STEPS]
