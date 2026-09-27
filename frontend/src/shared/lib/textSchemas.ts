import { z } from 'zod'

export function tooLongMessage(max: number): string {
  return `Keep it under ${max} characters`
}

// Trimmed text that must not be empty.
export function requiredText(max: number, emptyMessage: string) {
  return z.string().trim().min(1, emptyMessage).max(max, tooLongMessage(max))
}

// Trimmed text that may be left empty.
export function optionalText(max: number) {
  return z.string().trim().max(max, tooLongMessage(max))
}

// Form inputs are strings; the API wants null for "not set".
export function emptyToNull(value: string): string | null {
  return value === '' ? null : value
}
