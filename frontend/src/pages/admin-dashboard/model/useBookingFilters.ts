import { useSearchParams } from 'react-router'

import {
  BOOKING_TIMEFRAMES,
  type BookingFilters,
  type BookingStatus,
  type BookingTimeframe,
  isBookingStatus,
  isBookingTimeframe,
} from '@/entities/booking'

// Filters live in the address bar so refresh, back/forward and shared links keep them.
const PARAMS = {
  timeframe: 'timeframe',
  status: 'status',
  search: 'q',
  page: 'page',
} as const

const FIRST_PAGE = 1
const DEFAULT_TIMEFRAME = BOOKING_TIMEFRAMES.upcoming

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE
}

export function useBookingFilters() {
  const [params, setParams] = useSearchParams()

  const timeframeParam = params.get(PARAMS.timeframe)
  const statusParam = params.get(PARAMS.status)
  const filters: BookingFilters = {
    timeframe: isBookingTimeframe(timeframeParam) ? timeframeParam : DEFAULT_TIMEFRAME,
    status: isBookingStatus(statusParam) ? statusParam : null,
    search: params.get(PARAMS.search) ?? '',
    page: parsePage(params.get(PARAMS.page)),
  }

  // Any filter change goes back to page 1; defaults are left out of the URL.
  function update(changes: Partial<Record<keyof typeof PARAMS, string | null>>, replace = false) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        for (const [key, value] of Object.entries(changes)) {
          const name = PARAMS[key as keyof typeof PARAMS]
          if (value) next.set(name, value)
          else next.delete(name)
        }
        if (!('page' in changes)) next.delete(PARAMS.page)
        return next
      },
      { replace },
    )
  }

  return {
    filters,
    isNarrowed: filters.status !== null || filters.search.trim() !== '',
    setTimeframe: (timeframe: BookingTimeframe) =>
      update({ timeframe: timeframe === DEFAULT_TIMEFRAME ? null : timeframe }),
    setStatus: (status: BookingStatus | null) => update({ status }),
    // Typing shouldn't flood the browser history.
    setSearch: (search: string) => update({ search: search.trim() || null }, true),
    setPage: (page: number) => update({ page: page > FIRST_PAGE ? String(page) : null }),
    clearNarrowing: () => update({ status: null, search: null }),
  }
}
