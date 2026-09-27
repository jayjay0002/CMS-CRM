import { Link, useNavigate } from 'react-router'

import { SESSION_STATUS, useSession } from '@/entities/admin'
import { useSite } from '@/entities/site'
import { SetNewPasswordForm } from '@/features/reset-password'
import { ROUTES } from '@/shared/config'
import { AuthScreen } from '@/shared/ui'

// Supabase's reset email links here; supabase-js signs the user in from the link automatically.
export function AdminResetPasswordPage() {
  const sessionState = useSession()
  const brandName = useSite().data?.settings.businessName
  const navigate = useNavigate()

  if (sessionState.status === SESSION_STATUS.loading) {
    return (
      <AuthScreen brandName={brandName} title="Set a new password">
        <p role="status" className="text-ink/80">
          Checking your reset link…
        </p>
      </AuthScreen>
    )
  }

  if (sessionState.status !== SESSION_STATUS.signedIn) {
    return (
      <AuthScreen brandName={brandName} title="Set a new password">
        <p className="text-ink/80">This reset link has expired or was already used.</p>
        <Link
          to={ROUTES.adminLogin}
          className="mt-4 inline-block font-semibold underline decoration-cherry decoration-2 underline-offset-4"
        >
          Request a new link
        </Link>
      </AuthScreen>
    )
  }

  return (
    <AuthScreen brandName={brandName} title="Set a new password" subtitle={`For ${sessionState.session.user.email ?? 'your account'}`}>
      <SetNewPasswordForm onPasswordSet={() => navigate(ROUTES.admin, { replace: true })} />
    </AuthScreen>
  )
}
