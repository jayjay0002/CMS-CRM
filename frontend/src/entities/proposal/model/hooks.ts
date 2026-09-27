import { keepPreviousData, type QueryClient, useQuery } from '@tanstack/react-query'

import { ApiError, HTTP_STATUS } from '@/shared/api'

import {
  fetchAdminProposals,
  fetchBookingProposals,
  fetchProposal,
  fetchProposalSummary,
  fetchPublicProposal,
} from '../api/proposalsApi'
import { PROPOSAL_SUMMARY_REFRESH_MS } from '../config/proposals'
import { proposalKeys } from './queryKeys'
import type { ProposalListFilters } from './types'

const NOT_FOUND = 404
const MAX_RETRIES = 1

export function isProposalNotFound(error: Error | null): boolean {
  return error instanceof ApiError && error.status === NOT_FOUND
}

// A missing proposal (or one this admin can't see) won't appear on retry.
function shouldRetry(failureCount: number, error: Error): boolean {
  const isFinal = error instanceof ApiError && (error.status === NOT_FOUND || error.status === HTTP_STATUS.forbidden)
  return !isFinal && failureCount < MAX_RETRIES
}

export function useBookingProposals(bookingId: number) {
  return useQuery({
    queryKey: proposalKeys.forBooking(bookingId),
    queryFn: () => fetchBookingProposals(bookingId),
  })
}

export function useProposal(proposalId: number) {
  return useQuery({
    queryKey: proposalKeys.detail(proposalId),
    queryFn: () => fetchProposal(proposalId),
    retry: shouldRetry,
  })
}

export function usePublicProposal(token: string) {
  return useQuery({
    queryKey: proposalKeys.public(token),
    queryFn: () => fetchPublicProposal(token),
    retry: shouldRetry,
    // Each fetch records "viewed" on the server the first time; no need to poll.
    refetchOnWindowFocus: false,
  })
}

export function useAdminProposals(filters: ProposalListFilters) {
  return useQuery({
    queryKey: proposalKeys.list(filters),
    queryFn: () => fetchAdminProposals(filters),
    // Keep the current rows on screen while the next page or filter loads.
    placeholderData: keepPreviousData,
  })
}

export function useProposalSummary() {
  return useQuery({
    queryKey: proposalKeys.summary(),
    queryFn: fetchProposalSummary,
    refetchInterval: PROPOSAL_SUMMARY_REFRESH_MS,
    refetchOnWindowFocus: true,
  })
}

// After any proposal is created, changed or answered: refresh the Proposals list and nav badge.
export function invalidateProposalOverview(queryClient: QueryClient): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: proposalKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: proposalKeys.summary() }),
  ]).then(() => undefined)
}
