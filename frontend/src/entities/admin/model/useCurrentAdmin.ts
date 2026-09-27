import { skipToken, useQuery } from '@tanstack/react-query'

import { fetchCurrentAdmin } from '../api/fetchCurrentAdmin'
import { adminKeys } from './queryKeys'
import { SESSION_STATUS, useSession } from './session'

export function useCurrentAdmin() {
  const sessionState = useSession()
  const userId = sessionState.status === SESSION_STATUS.signedIn ? sessionState.session.user.id : null

  return useQuery({
    queryKey: adminKeys.me(userId ?? ''),
    queryFn: userId ? fetchCurrentAdmin : skipToken,
    // 401/403 mean "not signed in" / "not an admin", not a hiccup worth retrying.
    retry: false,
  })
}
