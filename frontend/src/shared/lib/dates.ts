export const BUSINESS_TIMEZONE = 'America/New_York'

const MS_PER_DAY = 86_400_000

// en-CA formats as YYYY-MM-DD, the same format as <input type="date">.
const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function todayInBusinessTimezone(): string {
  return isoDateFormatter.format(new Date())
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  const utcMidnight = Date.parse(`${isoDate}T00:00:00Z`)
  return new Date(utcMidnight + days * MS_PER_DAY).toISOString().slice(0, isoDate.length)
}
