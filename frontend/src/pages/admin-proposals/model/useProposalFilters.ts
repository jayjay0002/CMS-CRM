import { useSearchParams } from 'react-router'

import {
  isProposalListFilter,
  PROPOSAL_LIST_FILTERS,
  type ProposalListFilter,
  type ProposalListFilters,
} from '@/entities/proposal'

// Filters live in the address bar so refresh, back/forward and shared links keep them.
const PARAMS = {
  filter: 'filter',
  search: 'q',
  page: 'page',
} as const

const FIRST_PAGE = 1
const DEFAULT_FILTER = PROPOSAL_LIST_FILTERS.all

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE
}

export function useProposalFilters() {
  const [params, setParams] = useSearchParams()

  const filterParam = params.get(PARAMS.filter)
  const filters: ProposalListFilters = {
    filter: isProposalListFilter(filterParam) ? filterParam : DEFAULT_FILTER,
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
    isNarrowed: filters.filter !== DEFAULT_FILTER || filters.search.trim() !== '',
    setFilter: (filter: ProposalListFilter) => update({ filter: filter === DEFAULT_FILTER ? null : filter }),
    // Typing shouldn't flood the browser history.
    setSearch: (search: string) => update({ search: search.trim() || null }, true),
    setPage: (page: number) => update({ page: page > FIRST_PAGE ? String(page) : null }),
    clearNarrowing: () => update({ filter: null, search: null }),
  }
}
