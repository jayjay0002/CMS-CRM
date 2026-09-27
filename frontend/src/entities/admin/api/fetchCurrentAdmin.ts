import { apiFetch } from '@/shared/api'

import type { Admin } from '../model/types'

const ME_PATH = '/admin/auth/me'

export function fetchCurrentAdmin(): Promise<Admin> {
  return apiFetch<Admin>(ME_PATH, undefined, { auth: true })
}
