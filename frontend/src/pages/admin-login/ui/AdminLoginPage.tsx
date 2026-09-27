import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { SESSION_STATUS, useSession } from '@/entities/admin'
import { LoginForm } from '@/features/auth-by-password'
import { RequestResetForm } from '@/features/reset-password'
import { type LoginRedirectState, ROUTES } from '@/shared/config'
import { AuthScreen } from '@/shared/ui'

const MODES = {
  signIn: 'sign-in',
  forgotPassword: 'forgot-password',
} as const

type Mode = (typeof MODES)[keyof typeof MODES]

function BackToSite() {
  return (
    <Link to={ROUTES.home} className="font-semibold underline decoration-cherry decoration-2 underline-offset-4">
      Back to the website
    </Link>
  )
}

export function AdminLoginPage() {
  const [mode, setMode] = useState<Mode>(MODES.signIn)
  const sessionState = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as LoginRedirectState)?.from ?? ROUTES.admin

  if (sessionState.status === SESSION_STATUS.signedIn) {
    return <Navigate to={redirectTo} replace />
  }

  if (sessionState.status === SESSION_STATUS.unavailable) {
    return (
      <AuthScreen title="Admin sign in" footer={<BackToSite />}>
        <p className="text-ink/80">
          Admin sign-in isn't set up yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to
          frontend/.env.local.
        </p>
      </AuthScreen>
    )
  }

  if (mode === MODES.forgotPassword) {
    return (
      <AuthScreen
        title="Reset your password"
        subtitle="Enter your admin email and we'll send you a link to set a new password."
        footer={<BackToSite />}
      >
        <RequestResetForm onBackToSignIn={() => setMode(MODES.signIn)} />
      </AuthScreen>
    )
  }

  return (
    <AuthScreen title="Admin sign in" subtitle="Manage bookings, packages and the website." footer={<BackToSite />}>
      <LoginForm
        onSignedIn={() => navigate(redirectTo, { replace: true })}
        onForgotPassword={() => setMode(MODES.forgotPassword)}
      />
    </AuthScreen>
  )
}
