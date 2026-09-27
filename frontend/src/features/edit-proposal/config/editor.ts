// Wait this long after the last change before saving the draft.
export const AUTOSAVE_DELAY_MS = 1000

// One-click lines for common extras. Prices are starting suggestions: every line stays editable.
export const QUICK_ADD_ITEMS = [
  { label: 'Extra flavor', description: 'Extra flavor', unitPrice: '60.00' },
  { label: 'Extra hour', description: 'Extra hour of popping', unitPrice: '75.00' },
  { label: 'Custom sign', description: 'Custom sign with your names or logo', unitPrice: '40.00' },
  { label: 'Travel fee', description: 'Travel fee', unitPrice: '35.00' },
  { label: 'Attendant', description: 'Attendant for the event', unitPrice: '50.00' },
] as const

const PERCENT = 100

// Deposit shortcuts, as a share of the live total.
export const DEPOSIT_PRESETS = [
  { label: 'None', percent: 0 },
  { label: '25%', percent: 25 },
  { label: '50%', percent: 50 },
  { label: 'Full', percent: PERCENT },
] as const

export function depositForPercent(totalCents: number, percent: number): number {
  return Math.round((totalCents * percent) / PERCENT)
}

// "Valid until" shortcuts, in days from today.
const ONE_WEEK_DAYS = 7
const TWO_WEEKS_DAYS = 14
const ONE_MONTH_DAYS = 30
export const VALID_FOR_PRESETS = [ONE_WEEK_DAYS, TWO_WEEKS_DAYS, ONE_MONTH_DAYS] as const

export const SAVE_STATES = {
  saved: 'saved',
  // Changed, waiting for the autosave delay.
  pending: 'pending',
  saving: 'saving',
  error: 'error',
  // Changed but not saveable until the highlighted fields are fixed.
  invalid: 'invalid',
} as const

export type SaveState = (typeof SAVE_STATES)[keyof typeof SAVE_STATES]
