import { env } from '@/shared/config'

import { getSupabase } from './supabase'

export const HTTP_STATUS = {
  unauthorized: 401,
  forbidden: 403,
  unprocessable: 422,
} as const

export class ApiError extends Error {
  status: number
  // FastAPI's `detail` when it's a plain sentence meant for people (domain errors).
  detail: string | null

  constructor(status: number, message: string, detail: string | null) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

async function readDetail(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && 'detail' in body && typeof body.detail === 'string') {
      return body.detail
    }
  } catch {
    // Not JSON (e.g. a proxy error page); fall through.
  }
  return null
}

type ApiFetchOptions = {
  // Send the signed-in admin's Supabase access token.
  auth?: boolean
}

async function currentAccessToken(): Promise<string | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export async function apiFetch<T>(path: string, init?: RequestInit, options: ApiFetchOptions = {}): Promise<T> {
  const token = options.auth ? await currentAccessToken() : null
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    if (response.status === HTTP_STATUS.unauthorized && token) {
      // The API no longer accepts this session: sign out so the admin guard sends them to login.
      const supabase = await getSupabase()
      await supabase?.auth.signOut()
    }
    const detail = await readDetail(response)
    throw new ApiError(response.status, `${response.status} ${response.statusText}`, detail)
  }

  return response.json() as Promise<T>
}
