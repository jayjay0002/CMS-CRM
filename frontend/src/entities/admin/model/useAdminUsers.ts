import { useQuery } from '@tanstack/react-query'

import { fetchAdminUsers } from '../api/adminUsers'
import { adminKeys } from './queryKeys'

// Owners only; the page checks the role before using this.
export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: fetchAdminUsers,
    // 403 means "not an owner": retrying won't change that.
    retry: false,
  })
}
