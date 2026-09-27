export const INPUT_CLASSES =
  'w-full rounded-xl border-2 border-ink bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 aria-[invalid=true]:border-cherry'

export function errorId(fieldId: string): string {
  return `${fieldId}-error`
}

export function fieldAria(fieldId: string, error: string | undefined) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId(fieldId) : undefined,
  }
}
