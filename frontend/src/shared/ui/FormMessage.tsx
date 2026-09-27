import type { ReactNode } from 'react'

const TONE_CLASSES = {
  error: 'border-cherry bg-cherry/10 text-cherry-deep',
  success: 'border-ink bg-butter-soft text-ink',
} as const

type Props = {
  tone: keyof typeof TONE_CLASSES
  children: ReactNode
}

// Form-level feedback: errors are announced immediately, success politely.
export function FormMessage({ tone, children }: Props) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border-2 px-4 py-3 font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </p>
  )
}
