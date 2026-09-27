// Sign-painted buttons: thick ink outline and a hard offset shadow that presses in on click.
export const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-full border-2 px-6 py-3 text-base font-bold transition-[translate,box-shadow] duration-150 hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-60'

export const BUTTON_VARIANTS = {
  primary: 'border-ink bg-cherry text-kernel shadow-sign hover:shadow-[2px_2px_0_var(--color-ink)]',
  secondary: 'border-ink bg-kernel text-ink shadow-sign hover:shadow-[2px_2px_0_var(--color-ink)]',
  onDark:
    'border-butter bg-butter text-ink shadow-[4px_4px_0_var(--color-cherry)] hover:shadow-[2px_2px_0_var(--color-cherry)]',
} as const

export type ButtonVariant = keyof typeof BUTTON_VARIANTS

export function buttonClasses(variant: ButtonVariant, extra = ''): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${extra}`
}
