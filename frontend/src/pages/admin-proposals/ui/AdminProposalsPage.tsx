import {
  PROPOSAL_LIST_FILTER_LABELS,
  PROPOSAL_LIST_FILTERS,
  PROPOSALS_PAGE_SIZE,
  type ProposalListFilters,
  useAdminProposals,
  useProposalSummary,
} from '@/entities/proposal'
import { LIST_ACTION_BUTTON, Pagination } from '@/shared/ui'

import { useProposalFilters } from '../model/useProposalFilters'
import { ProposalFiltersBar } from './ProposalFiltersBar'
import { ProposalList } from './ProposalList'

const SKELETON_ROWS = 5

function emptyMessage(filters: ProposalListFilters, isNarrowed: boolean): string {
  if (!isNarrowed) return 'No proposals yet. Create one from a booking or with New proposal.'
  const kind =
    filters.filter === PROPOSAL_LIST_FILTERS.all
      ? 'proposals'
      : `${PROPOSAL_LIST_FILTER_LABELS[filters.filter].toLowerCase()} proposals`
  const search = filters.search.trim()
  return `No ${kind}${search ? ` matching “${search}”` : ''}.`
}

function LoadingRows() {
  return (
    <div role="status" aria-label="Loading proposals" className="space-y-2">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-2xl bg-ink/10" />
      ))}
    </div>
  )
}

export function AdminProposalsPage() {
  const { filters, isNarrowed, setFilter, setSearch, setPage, clearNarrowing } = useProposalFilters()
  const proposals = useAdminProposals(filters)
  const summary = useProposalSummary()

  function renderResults() {
    if (proposals.isPending) return <LoadingRows />
    if (proposals.isError) {
      return (
        <div role="alert" className="space-y-3 rounded-2xl border-2 border-cherry bg-cherry/5 p-6">
          <p className="font-semibold">We couldn’t load proposals.</p>
          <button type="button" onClick={() => proposals.refetch()} className={LIST_ACTION_BUTTON}>
            Try again
          </button>
        </div>
      )
    }
    if (proposals.data.items.length === 0) {
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
      <div className={`space-y-4 transition-opacity ${proposals.isPlaceholderData ? 'opacity-60' : ''}`}>
        <ProposalList proposals={proposals.data.items} />
        <Pagination
          page={filters.page}
          pageSize={PROPOSALS_PAGE_SIZE}
          total={proposals.data.total}
          onPageChange={setPage}
        />
      </div>
    )
  }

  return (
    <section className="space-y-8">
      {/* The highlighted "Proposals" nav tab already titles the page; the heading is for screen readers. */}
      <h1 className="sr-only">Proposals</h1>
      <ProposalFiltersBar
        filters={filters}
        awaitingCount={summary.data?.awaiting_count}
        onFilterChange={setFilter}
        onSearch={setSearch}
      />
      {renderResults()}
    </section>
  )
}
