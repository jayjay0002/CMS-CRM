import { ADMIN_ROLES, ADMIN_STATUSES, type AdminRole, type AdminStatus } from '../model/types'

export const ADMIN_ROLE_OPTIONS: readonly { value: AdminRole; label: string; description: string }[] = [
  {
    value: ADMIN_ROLES.owner,
    label: 'Owner',
    description: 'Everything, including inviting admins and changing roles.',
  },
  {
    value: ADMIN_ROLES.staff,
    label: 'Staff',
    description: 'Bookings, packages and the website. Can’t manage admins.',
  },
]

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  [ADMIN_ROLES.owner]: 'Owner',
  [ADMIN_ROLES.staff]: 'Staff',
}

export const ADMIN_STATUS_LABELS: Record<AdminStatus, string> = {
  [ADMIN_STATUSES.active]: 'Active',
  [ADMIN_STATUSES.invited]: 'Invited',
  [ADMIN_STATUSES.deactivated]: 'Deactivated',
}

export const ADMIN_STATUS_BADGE_CLASSES: Record<AdminStatus, string> = {
  [ADMIN_STATUSES.active]: 'bg-butter text-ink',
  [ADMIN_STATUSES.invited]: 'border-2 border-dashed border-ink/50 bg-white text-ink',
  [ADMIN_STATUSES.deactivated]: 'bg-ink/10 text-ink/70 line-through',
}
