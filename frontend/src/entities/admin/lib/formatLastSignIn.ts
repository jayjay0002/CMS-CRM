const NEVER_SIGNED_IN = 'Never'

const signInDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatLastSignIn(isoTimestamp: string | null): string {
  return isoTimestamp ? signInDateFormatter.format(new Date(isoTimestamp)) : NEVER_SIGNED_IN
}
