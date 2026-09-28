import { type ReactNode, useState } from 'react'

import { prefersReducedMotion } from '@/shared/lib'
import { type ButtonVariant, buttonClasses, Kernel } from '@/shared/ui'

// Where each kernel flies when the button is clicked (read by the `burst` keyframes).
const BURST_PIECES = [
  { id: 'up-left', className: '[--bx:-80px] [--by:-90px] [--br:-120deg]' },
  { id: 'up', className: '[--bx:-10px] [--by:-125px] [--br:90deg]' },
  { id: 'up-right', className: '[--bx:75px] [--by:-100px] [--br:160deg]' },
  { id: 'left', className: '[--bx:-115px] [--by:-40px] [--br:-60deg]' },
  { id: 'right', className: '[--bx:120px] [--by:-50px] [--br:80deg]' },
  { id: 'high-left', className: '[--bx:-50px] [--by:-140px] [--br:200deg]' },
  { id: 'high-right', className: '[--bx:40px] [--by:-150px] [--br:-150deg]' },
] as const

// Long enough to see the burst before the booking form covers the page.
const OPEN_AFTER_BURST_MS = 380

type Props = {
  children: ReactNode
  onBook: () => void
  variant?: ButtonVariant
  className?: string
}

export function BookButton({ children, onBook, variant = 'primary', className = '' }: Props) {
  const [burstCount, setBurstCount] = useState(0)

  function handleClick() {
    if (prefersReducedMotion()) {
      onBook()
      return
    }
    setBurstCount((count) => count + 1)
    window.setTimeout(onBook, OPEN_AFTER_BURST_MS)
  }

  return (
    <span className="relative inline-flex">
      <button type="button" aria-haspopup="dialog" onClick={handleClick} className={buttonClasses(variant, className)}>
        {children}
      </button>
      {burstCount > 0 && (
        <span
          key={burstCount}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          {BURST_PIECES.map((piece) => (
            <Kernel key={piece.id} className={`absolute size-8 animate-burst ${piece.className}`} />
          ))}
        </span>
      )}
    </span>
  )
}
