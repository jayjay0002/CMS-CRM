import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { SESSION_STATUS, useCurrentAdmin, useSession } from '@/entities/admin'
import { useLogout } from '@/features/auth-logout'
import { ApiError, HTTP_STATUS } from '@/shared/api'
import { type LoginRedirectState, ROUTES } from '@/shared/config'
import { buttonClasses } from '@/shared/ui'

function StatusScreen({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="grid min-h-screen place-items-center bg-kernel p-6 text-center text-lg">
      <div>{children}</div>
    </div>
  )
}

function isForbidden(error: Error): boolean {
  return error instanceof ApiError && error.status === HTTP_STATUS.forbidden
}

type Props = {
  children: ReactNode
}

export function RequireAdmin({ children }: Props) {
  const sessionState = useSession()
  const location = useLocation()
  const adminQuery = useCurrentAdmin()
  const logout = useLogout()

  if (sessionState.status === SESSION_STATUS.loading) {
    return <StatusScreen>Checking your sign-in…</StatusScreen>
  }
  if (sessionState.status !== SESSION_STATUS.signedIn) {
    const state: LoginRedirectState = { from: location.pathname }
    return <Navigate to={ROUTES.adminLogin} replace state={state} />
  }
  if (adminQuery.isPending) {
    return <StatusScreen>Checking your sign-in…</StatusScreen>
  }
  if (adminQuery.isError) {
    // A 401 signs the session out (see shared/api) and re-renders into the redirect above.
    if (isForbidden(adminQuery.error)) {
      return (
        <StatusScreen>
          <p>This account doesn't have admin access.</p>
          <button type="button" onClick={logout} className={buttonClasses('secondary', 'mt-4')}>
            Sign out
          </button>
        </StatusScreen>
      )
    }
    return (
      <StatusScreen>
        <p>We couldn't reach the server.</p>
        <button type="button" onClick={() => adminQuery.refetch()} className={buttonClasses('secondary', 'mt-4')}>
          Try again
        </button>
      </StatusScreen>
    )
  }
  return children
}
