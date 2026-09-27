import { useState } from 'react'

import { useDebouncedCallback } from '@/shared/lib'

import { INPUT_CLASSES } from './fieldStyles'

// Long enough to wait out typing, short enough to feel live.
export const SEARCH_DEBOUNCE_MS = 300

type Props = {
  id: string
  // Read by screen readers; the placeholder is the visible hint.
  label: string
  placeholder: string
  maxLength: number
  // The search currently applied (e.g. from the URL).
  appliedSearch: string
  onSearch: (search: string) => void
  className?: string
}

// Search-as-you-type that reports once typing pauses.
export function SearchField({ id, label, placeholder, maxLength, appliedSearch, onSearch, className = '' }: Props) {
  const [value, setValue] = useState(appliedSearch)
  const [lastApplied, setLastApplied] = useState(appliedSearch)
  const debouncedSearch = useDebouncedCallback(onSearch, SEARCH_DEBOUNCE_MS)

  // Follow the applied search when it changes from outside (Clear filters, back/forward),
  // but not when it's just catching up with what's being typed.
  if (appliedSearch !== lastApplied) {
    setLastApplied(appliedSearch)
    if (appliedSearch !== value.trim()) setValue(appliedSearch)
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => {
          setValue(event.target.value)
          debouncedSearch(event.target.value)
        }}
        className={`${INPUT_CLASSES} py-2`}
      />
    </div>
  )
}
