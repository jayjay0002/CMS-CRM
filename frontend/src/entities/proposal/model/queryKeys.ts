import type { ProposalListFilters } from './types'

export const proposalKeys = {
  all: ['proposals'] as const,
  forBooking: (bookingId: number) => [...proposalKeys.all, 'booking', bookingId] as const,
  lists: () => [...proposalKeys.all, 'list'] as const,
  list: (filters: ProposalListFilters) => [...proposalKeys.lists(), filters] as const,
  summary: () => [...proposalKeys.all, 'summary'] as const,
  details: () => [...proposalKeys.all, 'detail'] as const,
  detail: (proposalId: number) => [...proposalKeys.details(), proposalId] as const,
  public: (token: string) => [...proposalKeys.all, 'public', token] as const,
}
