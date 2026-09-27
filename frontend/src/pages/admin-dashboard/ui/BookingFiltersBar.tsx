import { useState } from 'react'

import {
  BOOKING_SEARCH_MAX_LENGTH,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_ORDER,
  BOOKING_STATUSES,
  BOOKING_TIMEFRAME_LABELS,
  BOOKING_TIMEFRAME_ORDER,
  type BookingFilters,
  type BookingStatus,
  type BookingTimeframe,
} from '@/entities/booking'
import { useDebouncedCallback } from '@/shared/lib'
import { INPUT_CLASSES } from '@/shared/ui'

const SEARCH_DEBOUNCE_MS = 300
const SEARCH_FIELD_ID = 'booking-search'

const TAB_BASE = 'rounded-full px-4 py-1.5 font-semibold transition-colors'
const CHIP_BASE = 'inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1 text-sm font-semibold transition-colors'

function tabClasses(isActive: boolean): string {
  return isActive ? `${TAB_BASE} bg-ink text-kernel` : `${TAB_BASE} text-ink/75 hover:bg-ink/10 hover:text-ink`
}

function chipClasses(isActive: boolean): string {
  return isActive
    ? `${CHIP_BASE} border-ink bg-butter text-ink`
    : `${CHIP_BASE} border-ink/25 bg-white text-ink/80 hover:border-ink`
}

type SearchBoxProps = {
  // The search currently in the URL.
  appliedSearch: string
  onSearch: (search: string) => void
}

function SearchBox({ appliedSearch, onSearch }: SearchBoxProps) {
  const [value, setValue] = useState(appliedSearch)
  const [lastApplied, setLastApplied] = useState(appliedSearch)
  const debouncedSearch = useDebouncedCallback(onSearch, SEARCH_DEBOUNCE_MS)

  // Follow the URL when it changes from outside (Clear filters, back/forward),
  // but not when it's just catching up with what's being typed.
  if (appliedSearch !== lastApplied) {
    setLastApplied(appliedSearch)
    if (appliedSearch !== value.trim()) setValue(appliedSearch)
  }

  return (
    <div className="w-full sm:max-w-xs">
      <label htmlFor={SEARCH_FIELD_ID} className="sr-only">
        Search bookings by reference or customer name
      </label>
      <input
        id={SEARCH_FIELD_ID}
        type="search"
        value={value}
        maxLength={BOOKING_SEARCH_MAX_LENGTH}
        placeholder="Search reference or name"
        onChange={(event) => {
          setValue(event.target.value)
          debouncedSearch(event.target.value)
        }}
        className={`${INPUT_CLASSES} py-2`}
      />
    </div>
  )
}

type Props = {
  filters: BookingFilters
  pendingCount: number | undefined
  onTimeframeChange: (timeframe: BookingTimeframe) => void
  onStatusChange: (status: BookingStatus | null) => void
  onSearch: (search: string) => void
}

export function BookingFiltersBar({
  filters,
  pendingCount,
  onTimeframeChange,
  onStatusChange,
  onSearch,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="When" className="flex flex-wrap gap-1 rounded-full border-2 border-ink bg-white p-1">
          {BOOKING_TIMEFRAME_ORDER.map((timeframe) => (
            <button
              key={timeframe}
              type="button"
              aria-pressed={filters.timeframe === timeframe}
              onClick={() => onTimeframeChange(timeframe)}
              className={tabClasses(filters.timeframe === timeframe)}
            >
              {BOOKING_TIMEFRAME_LABELS[timeframe]}
            </button>
          ))}
        </div>
        <SearchBox appliedSearch={filters.search} onSearch={onSearch} />
      </div>

      <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={filters.status === null}
          onClick={() => onStatusChange(null)}
          className={chipClasses(filters.status === null)}
        >
          All statuses
        </button>
        {BOOKING_STATUS_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={filters.status === status}
            onClick={() => onStatusChange(status)}
            className={chipClasses(filters.status === status)}
          >
            {BOOKING_STATUS_LABELS[status]}
            {status === BOOKING_STATUSES.pending && pendingCount !== undefined && pendingCount > 0 && (
              <span className="rounded-full bg-cherry px-1.5 text-xs font-bold text-kernel">
                {pendingCount}
                <span className="sr-only"> waiting</span>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
