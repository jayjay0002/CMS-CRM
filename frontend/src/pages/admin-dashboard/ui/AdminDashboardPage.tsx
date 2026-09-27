import {
  BOOKING_STATUS_LABELS,
  BOOKING_TIMEFRAME_LABELS,
  BOOKING_TIMEFRAMES,
  BOOKINGS_PAGE_SIZE,
  type BookingFilters,
  useAdminBookings,
  useBookingSummary,
} from '@/entities/booking'
import { LIST_ACTION_BUTTON, Pagination } from '@/shared/ui'

import { useBookingFilters } from '../model/useBookingFilters'
import { BookingFiltersBar } from './BookingFiltersBar'
import { BookingList } from './BookingList'

const SKELETON_ROWS = 5

function emptyMessage(filters: BookingFilters, isNarrowed: boolean): string {
  if (isNarrowed) {
    const words = [
      filters.timeframe !== BOOKING_TIMEFRAMES.all && BOOKING_TIMEFRAME_LABELS[filters.timeframe].toLowerCase(),
      filters.status && BOOKING_STATUS_LABELS[filters.status].toLowerCase(),
      'bookings',
    ].filter(Boolean)
    const search = filters.search.trim()
    return `No ${words.join(' ')}${search ? ` matching “${search}”` : ''}.`
  }
  if (filters.timeframe === BOOKING_TIMEFRAMES.upcoming) {
    return 'No upcoming bookings yet. They’ll appear here as soon as customers book.'
  }
  if (filters.timeframe === BOOKING_TIMEFRAMES.past) return 'No past events yet.'
  return 'No bookings yet. They’ll appear here as soon as customers book.'
}

function LoadingRows() {
  return (
    <div role="status" aria-label="Loading bookings" className="space-y-2">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-2xl bg-ink/10" />
      ))}
    </div>
  )
}

export function AdminDashboardPage() {
  const { filters, isNarrowed, setTimeframe, setStatus, setSearch, setPage, clearNarrowing } = useBookingFilters()
  const bookings = useAdminBookings(filters)
  const summary = useBookingSummary()

  function renderResults() {
    if (bookings.isPending) return <LoadingRows />
    if (bookings.isError) {
      return (
        <div role="alert" className="space-y-3 rounded-2xl border-2 border-cherry bg-cherry/5 p-6">
          <p className="font-semibold">We couldn’t load bookings.</p>
          <button type="button" onClick={() => bookings.refetch()} className={LIST_ACTION_BUTTON}>
            Try again
          </button>
        </div>
      )
    }
    if (bookings.data.items.length === 0) {
      return (
        <div className="space-y-3 rounded-2xl border-2 border-dashed border-ink/40 p-8 text-center">
          <p className="text-lg text-ink/80">{emptyMessage(filters, isNarrowed)}</p>
          {isNarrowed && (
            <button type="button" onClick={clearNarrowing} className={LIST_ACTION_BUTTON}>
              Clear filters
            </button>
          )}
        </div>
      )
    }
    return (
      <div className={`space-y-4 transition-opacity ${bookings.isPlaceholderData ? 'opacity-60' : ''}`}>
        <BookingList bookings={bookings.data.items} />
        <Pagination
          page={filters.page}
          pageSize={BOOKINGS_PAGE_SIZE}
          total={bookings.data.total}
          onPageChange={setPage}
        />
      </div>
    )
  }

  return (
    <section className="space-y-8">
      {/* The highlighted "Bookings" nav tab already titles the page; the heading is for screen readers. */}
      <h1 className="sr-only">Bookings</h1>
      <BookingFiltersBar
        filters={filters}
        pendingCount={summary.data?.pending_count}
        onTimeframeChange={setTimeframe}
        onStatusChange={setStatus}
        onSearch={setSearch}
      />
      {renderResults()}
    </section>
  )
}
