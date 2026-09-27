import { apiFetch } from '@/shared/api'

import { PROPOSALS_PAGE_SIZE } from '../config/proposals'
import type {
  AdminProposal,
  ProposalDraftInput,
  ProposalListFilters,
  ProposalPage,
  ProposalSummary,
  PublicProposal,
} from '../model/types'

const AUTH = { auth: true } as const
const ADMIN_BOOKINGS_PATH = '/admin/bookings'
const ADMIN_PROPOSALS_PATH = '/admin/proposals'
const PUBLIC_PROPOSALS_PATH = '/proposals'
const PROPOSALS_SUMMARY_PATH = `${ADMIN_PROPOSALS_PATH}/summary`
const FIRST_PAGE = 1

function json(method: 'POST' | 'PUT', body?: unknown): RequestInit {
  return body === undefined ? { method } : { method, body: JSON.stringify(body) }
}

function bookingProposalsPath(bookingId: number): string {
  return `${ADMIN_BOOKINGS_PATH}/${bookingId}/proposals`
}

function proposalPath(proposalId: number): string {
  return `${ADMIN_PROPOSALS_PATH}/${proposalId}`
}

function publicPath(token: string): string {
  return `${PUBLIC_PROPOSALS_PATH}/${encodeURIComponent(token)}`
}

// --- Admin ---

export function proposalListQueryString(filters: ProposalListFilters): string {
  const params = new URLSearchParams({
    filter: filters.filter,
    limit: String(PROPOSALS_PAGE_SIZE),
    offset: String((Math.max(filters.page, FIRST_PAGE) - FIRST_PAGE) * PROPOSALS_PAGE_SIZE),
  })
  const search = filters.search.trim()
  if (search) params.set('q', search)
  return params.toString()
}

export function fetchAdminProposals(filters: ProposalListFilters): Promise<ProposalPage> {
  return apiFetch<ProposalPage>(`${ADMIN_PROPOSALS_PATH}?${proposalListQueryString(filters)}`, undefined, AUTH)
}

export function fetchProposalSummary(): Promise<ProposalSummary> {
  return apiFetch<ProposalSummary>(PROPOSALS_SUMMARY_PATH, undefined, AUTH)
}

export function fetchBookingProposals(bookingId: number): Promise<AdminProposal[]> {
  return apiFetch<AdminProposal[]>(bookingProposalsPath(bookingId), undefined, AUTH)
}

export function createProposal(bookingId: number): Promise<AdminProposal> {
  return apiFetch<AdminProposal>(bookingProposalsPath(bookingId), json('POST'), AUTH)
}

export function fetchProposal(proposalId: number): Promise<AdminProposal> {
  return apiFetch<AdminProposal>(proposalPath(proposalId), undefined, AUTH)
}

export function updateProposal(proposalId: number, draft: ProposalDraftInput): Promise<AdminProposal> {
  return apiFetch<AdminProposal>(proposalPath(proposalId), json('PUT', draft), AUTH)
}

export function sendProposal(proposalId: number): Promise<AdminProposal> {
  return apiFetch<AdminProposal>(`${proposalPath(proposalId)}/send`, json('POST'), AUTH)
}

export function duplicateProposal(proposalId: number): Promise<AdminProposal> {
  return apiFetch<AdminProposal>(`${proposalPath(proposalId)}/duplicate`, json('POST'), AUTH)
}

export function deleteProposal(proposalId: number): Promise<void> {
  return apiFetch<void>(proposalPath(proposalId), { method: 'DELETE' }, AUTH)
}

// --- Public (secret token in the URL, no sign-in) ---

export function fetchPublicProposal(token: string): Promise<PublicProposal> {
  return apiFetch<PublicProposal>(publicPath(token))
}

export function acceptProposal(token: string): Promise<PublicProposal> {
  return apiFetch<PublicProposal>(`${publicPath(token)}/accept`, json('POST'))
}

export function declineProposal(token: string, reason: string | null): Promise<PublicProposal> {
  return apiFetch<PublicProposal>(`${publicPath(token)}/decline`, json('POST', { reason }))
}
