import {
  PROPOSAL_LIST_FILTER_LABELS,
  PROPOSAL_LIST_FILTER_ORDER,
  PROPOSAL_LIST_FILTERS,
  PROPOSAL_SEARCH_MAX_LENGTH,
  type ProposalListFilter,
  type ProposalListFilters,
} from '@/entities/proposal'
import { NewProposalButton } from '@/features/create-proposal'
import { filterChipClasses, SearchField } from '@/shared/ui'

const SEARCH_FIELD_ID = 'proposal-search'

type Props = {
  filters: ProposalListFilters
  awaitingCount: number | undefined
  onFilterChange: (filter: ProposalListFilter) => void
  onSearch: (search: string) => void
}

export function ProposalFiltersBar({ filters, awaitingCount, onFilterChange, onSearch }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <NewProposalButton />
        <SearchField
          id={SEARCH_FIELD_ID}
          label="Search proposals by booking reference or customer name"
          placeholder="Search reference or name"
          maxLength={PROPOSAL_SEARCH_MAX_LENGTH}
          appliedSearch={filters.search}
          onSearch={onSearch}
          className="w-full sm:max-w-xs"
        />
      </div>

      <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
        {PROPOSAL_LIST_FILTER_ORDER.map((filter) => (
          <button
            key={filter}
            type="button"
            aria-pressed={filters.filter === filter}
            onClick={() => onFilterChange(filter)}
            className={filterChipClasses(filters.filter === filter)}
          >
            {PROPOSAL_LIST_FILTER_LABELS[filter]}
            {filter === PROPOSAL_LIST_FILTERS.awaiting && awaitingCount !== undefined && awaitingCount > 0 && (
              <span className="rounded-full bg-ink px-1.5 text-xs font-bold text-butter">
                {awaitingCount}
                <span className="sr-only"> awaiting reply</span>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
