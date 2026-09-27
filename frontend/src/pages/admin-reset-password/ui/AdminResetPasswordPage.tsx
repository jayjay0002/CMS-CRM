import { Link, useNavigate } from 'react-router'

import { AUTH_LINK_TYPES, SESSION_STATUS, useSession } from '@/entities/admin'
import { useSite } from '@/entities/site'
import { SetNewPasswordForm } from '@/features/reset-password'
import { ROUTES } from '@/shared/config'
import { AuthScreen } from '@/shared/ui'

const COPY = {
  reset: {
    title: 'Set a new password',
    checking: 'Checking your reset link…',
    expired: 'This reset link has expired or was already used.',
    submit: 'Save new password',
  },
  invite: {
    title: 'Set up your account',
    welcome: 'Welcome! Choose a password to finish setting up your account.',
    submit: 'Save password and continue',
  },
} as const

// Supabase reset and invite links land here; supabase-js signs the user in from the link.
export function AdminResetPasswordPage() {
  const sessionState = useSession()
  const brandName = useSite().data?.settings.businessName
  const navigate = useNavigate()

  if (sessionState.status === SESSION_STATUS.loading) {
    return (
      <AuthScreen brandName={brandName} title={COPY.reset.title}>
        <p role="status" className="text-ink/80">
          {COPY.reset.checking}
        </p>
      </AuthScreen>
    )
  }

  if (sessionState.status !== SESSION_STATUS.signedIn) {
    return (
      <AuthScreen brandName={brandName} title={COPY.reset.title}>
        <p className="text-ink/80">{COPY.reset.expired}</p>
        <p className="mt-2 text-sm text-ink/70">
          Got an invite link? Ask the person who invited you for a new one.
        </p>
        <Link
          to={ROUTES.adminLogin}
          className="mt-4 inline-block font-semibold underline decoration-cherry decoration-2 underline-offset-4"
        >
          Request a new reset link
        </Link>
      </AuthScreen>
    )
  }

  const isInvite = sessionState.arrivedVia === AUTH_LINK_TYPES.invite
  const email = sessionState.session.user.email ?? 'your account'
  const goToAdmin = () => navigate(ROUTES.admin, { replace: true })

  if (isInvite) {
    return (
      <AuthScreen brandName={brandName} title={COPY.invite.title} subtitle={email}>
        <p className="mb-5 font-semibold text-ink">{COPY.invite.welcome}</p>
        <SetNewPasswordForm onPasswordSet={goToAdmin} submitLabel={COPY.invite.submit} />
      </AuthScreen>
    )
  }

  return (
    <AuthScreen brandName={brandName} title={COPY.reset.title} subtitle={`For ${email}`}>
      <SetNewPasswordForm onPasswordSet={goToAdmin} submitLabel={COPY.reset.submit} />
    </AuthScreen>
  )
}
