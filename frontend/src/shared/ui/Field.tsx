import type { ReactNode } from 'react'

import { errorId } from './fieldStyles'

type Props = {
  label: string
  htmlFor: string
  error?: string
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, error, className = '', children }: Props) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId(htmlFor)} className="mt-1.5 text-sm font-semibold text-cherry-deep">
          {error}
        </p>
      )}
    </div>
  )
}
