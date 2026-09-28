import type { BookingStep } from '../config/constants'

// Heads one group of the booking form. The number is decoration; the title names the group.
export function StepLegend({ step }: { step: BookingStep }) {
  return (
    <legend className="mb-4 flex items-center gap-3 font-display text-xl">
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-sans text-sm font-bold text-butter"
      >
        {step.number}
      </span>
      {step.title}
    </legend>
  )
}
