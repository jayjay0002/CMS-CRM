export const ADMIN_ROLES = {
  owner: 'owner',
  staff: 'staff',
} as const

export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES]

export const ADMIN_STATUSES = {
  active: 'active',
  // Invited but hasn't signed in yet.
  invited: 'invited',
  deactivated: 'deactivated',
} as const

export type AdminStatus = (typeof ADMIN_STATUSES)[keyof typeof ADMIN_STATUSES]

// GET /admin/auth/me
export type Admin = {
  id: number
  email: string
  full_name: string
  role: AdminRole
}

// GET /admin/users (owners only)
export type AdminListItem = Admin & {
  is_active: boolean
  status: AdminStatus
  last_sign_in_at: string | null
}

// POST /admin/users
export type AdminInvitePayload = {
  email: string
  full_name: string
  role: AdminRole
}

export type AdminInviteResponse = {
  admin: AdminListItem
  // One-time link the owner shares so the new admin can set their own password.
  invite_link: string
}

// PATCH /admin/users/{id}
export type AdminUpdatePayload = {
  role?: AdminRole
  is_active?: boolean
}

// POST /admin/users/{id}/sign-in-link
export type SignInLinkResponse = {
  invite_link: string
}
