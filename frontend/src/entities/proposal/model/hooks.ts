import { useQuery } from '@tanstack/react-query'

import { ApiError, HTTP_STATUS } from '@/shared/api'

import { fetchBookingProposals, fetchProposal, fetchPublicProposal } from '../api/proposalsApi'
import { proposalKeys } from './queryKeys'

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
