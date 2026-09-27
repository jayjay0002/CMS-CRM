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

// How someone arrived through an emailed/shared Supabase link, if they did.
export const AUTH_LINK_TYPES = {
  invite: 'invite',
  recovery: 'recovery',
} as const

export type AuthLinkType = (typeof AUTH_LINK_TYPES)[keyof typeof AUTH_LINK_TYPES]

export type SessionState =
  | { status: typeof SESSION_STATUS.unavailable }
  | { status: typeof SESSION_STATUS.loading }
  | { status: typeof SESSION_STATUS.signedOut }
  | { status: typeof SESSION_STATUS.signedIn; session: Session; arrivedVia: AuthLinkType | null }

// Supabase fires this when the user arrives from a password-reset link.
const PASSWORD_RECOVERY_EVENT: AuthChangeEvent = 'PASSWORD_RECOVERY'
const LINK_TYPE_PARAM = 'type'
const HASH_PREFIX = '#'

function linkTypeFromUrl(): AuthLinkType | null {
  // Read before supabase-js consumes and clears the hash (invite links only say so here).
  const params = new URLSearchParams(window.location.hash.replace(HASH_PREFIX, ''))
  const type = params.get(LINK_TYPE_PARAM)
  return Object.values(AUTH_LINK_TYPES).find((linkType) => linkType === type) ?? null
}

const initialLinkType = linkTypeFromUrl()

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
  const previousLinkType = state.status === SESSION_STATUS.signedIn ? state.arrivedVia : initialLinkType
  setState({
    status: SESSION_STATUS.signedIn,
    session,
    arrivedVia: event === PASSWORD_RECOVERY_EVENT ? AUTH_LINK_TYPES.recovery : previousLinkType,
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
