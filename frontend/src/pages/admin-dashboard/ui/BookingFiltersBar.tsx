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
import { FILTER_TABS_FRAME, filterChipClasses, filterTabClasses, SearchField } from '@/shared/ui'

const SEARCH_FIELD_ID = 'booking-search'

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
        <div role="group" aria-label="When" className={FILTER_TABS_FRAME}>
          {BOOKING_TIMEFRAME_ORDER.map((timeframe) => (
            <button
              key={timeframe}
              type="button"
              aria-pressed={filters.timeframe === timeframe}
              onClick={() => onTimeframeChange(timeframe)}
              className={filterTabClasses(filters.timeframe === timeframe)}
            >
              {BOOKING_TIMEFRAME_LABELS[timeframe]}
            </button>
          ))}
        </div>
        <SearchField
          id={SEARCH_FIELD_ID}
          label="Search bookings by reference or customer name"
          placeholder="Search reference or name"
          maxLength={BOOKING_SEARCH_MAX_LENGTH}
          appliedSearch={filters.search}
          onSearch={onSearch}
          className="w-full sm:max-w-xs"
        />
      </div>

      <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={filters.status === null}
          onClick={() => onStatusChange(null)}
          className={filterChipClasses(filters.status === null)}
        >
          All statuses
        </button>
        {BOOKING_STATUS_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={filters.status === status}
            onClick={() => onStatusChange(status)}
            className={filterChipClasses(filters.status === status)}
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
