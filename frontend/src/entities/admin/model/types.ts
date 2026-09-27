export const ADMIN_ROLES = {
  owner: 'owner',
  staff: 'staff',
} as const

export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES]

// GET /admin/auth/me
export type Admin = {
  id: number
  email: string
  full_name: string
  role: AdminRole
}
