// `min-w-0` lets an input shrink inside grid and flex rows. Date and time inputs lose their
// native box on phones (iOS gives them a fixed minimum width that pushes forms off-screen)
// and keep a minimum height, since an empty one would otherwise collapse without a value.
const DATE_TIME_FIXES =
  '[&[type=date]]:min-h-12 [&[type=date]]:appearance-none [&[type=time]]:min-h-12 [&[type=time]]:appearance-none'

export const INPUT_CLASSES = `w-full min-w-0 rounded-xl border-2 border-ink bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 aria-[invalid=true]:border-cherry ${DATE_TIME_FIXES}`

export function errorId(fieldId: string): string {
  return `${fieldId}-error`
}

export function fieldAria(fieldId: string, error: string | undefined) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId(fieldId) : undefined,
  }
}
