import { apiFetch } from '@/shared/api'

import type {
  AdminInvitePayload,
  AdminInviteResponse,
  AdminListItem,
  AdminUpdatePayload,
  SignInLinkResponse,
} from '../model/types'

const ADMIN_USERS_PATH = '/admin/users'

function adminPath(adminId: number): string {
  return `${ADMIN_USERS_PATH}/${adminId}`
}

export function fetchAdminUsers(): Promise<AdminListItem[]> {
  return apiFetch<AdminListItem[]>(ADMIN_USERS_PATH, undefined, { auth: true })
}

export function inviteAdmin(payload: AdminInvitePayload): Promise<AdminInviteResponse> {
  return apiFetch<AdminInviteResponse>(
    ADMIN_USERS_PATH,
    { method: 'POST', body: JSON.stringify(payload) },
    { auth: true },
  )
}

export function updateAdmin(adminId: number, payload: AdminUpdatePayload): Promise<AdminListItem> {
  return apiFetch<AdminListItem>(
    adminPath(adminId),
    { method: 'PATCH', body: JSON.stringify(payload) },
    { auth: true },
  )
}

export function fetchSignInLink(adminId: number): Promise<SignInLinkResponse> {
  return apiFetch<SignInLinkResponse>(`${adminPath(adminId)}/sign-in-link`, { method: 'POST' }, { auth: true })
}
