// Event dates and times are the event's own local values ("2026-10-18", "18:30:00"):
// they're formatted exactly as stored, never shifted through the viewer's timezone.

const LOCALE = 'en-US'
const UTC = 'UTC'
const ISO_DATE_LENGTH = 10

const eventDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: UTC,
})

const eventTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: UTC,
})

const timestampFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

// "2026-10-18" -> "Sun, Oct 18, 2026"
export function formatEventDate(isoDate: string): string {
  return eventDateFormatter.format(new Date(`${isoDate.slice(0, ISO_DATE_LENGTH)}T00:00:00Z`))
}

// "18:30:00" -> "6:30 PM"
export function formatEventTime(isoTime: string): string {
  return eventTimeFormatter.format(new Date(`1970-01-01T${isoTime}Z`))
}

// A moment (created_at, status_changed_at) in the viewer's own calendar: "Sep 27, 2026".
export function formatBookingTimestamp(isoTimestamp: string): string {
  return timestampFormatter.format(new Date(isoTimestamp))
}

export function googleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
