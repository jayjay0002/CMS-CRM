import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useSyncExternalStore } from 'react'

import { getSupabase, isSupabaseConfigured } from '@/shared/api'

export const SESSION_STATUS = {
  // Supabase env vars missing: admin sign-in can't work at all.
  unavailable: 'unavailable',
  loading: 'loading',
  signedOut: 'signed-out',
  signedIn: 'signed-in',
} as const

export type SessionState =
  | { status: typeof SESSION_STATUS.unavailable }
  | { status: typeof SESSION_STATUS.loading }
  | { status: typeof SESSION_STATUS.signedOut }
  | { status: typeof SESSION_STATUS.signedIn; session: Session; isPasswordRecovery: boolean }

// Supabase fires this when the user arrives from a password-reset email link.
const PASSWORD_RECOVERY_EVENT: AuthChangeEvent = 'PASSWORD_RECOVERY'

type Listener = () => void
const listeners = new Set<Listener>()

let state: SessionState = isSupabaseConfigured
  ? { status: SESSION_STATUS.loading }
  : { status: SESSION_STATUS.unavailable }

function setState(next: SessionState): void {
  state = next
  listeners.forEach((listener) => listener())
}

function handleAuthChange(event: AuthChangeEvent, session: Session | null): void {
  if (!session) {
    setState({ status: SESSION_STATUS.signedOut })
    return
  }
  const wasRecovering = state.status === SESSION_STATUS.signedIn && state.isPasswordRecovery
  setState({
    status: SESSION_STATUS.signedIn,
    session,
    isPasswordRecovery: event === PASSWORD_RECOVERY_EVENT || wasRecovering,
  })
}

// One subscription for the whole app, started when the admin area first loads.
// INITIAL_SESSION fires right away with the stored session.
void getSupabase().then((supabase) => supabase?.auth.onAuthStateChange(handleAuthChange))

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): SessionState {
  return state
}

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getSnapshot)
}
