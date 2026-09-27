import { useMutation } from '@tanstack/react-query'

import { getSupabase } from '@/shared/api'

// Supabase Auth's error code for a wrong email/password pair.
const INVALID_CREDENTIALS_CODE = 'invalid_credentials'

export class SignInError extends Error {
  isInvalidCredentials: boolean

  constructor(message: string, isInvalidCredentials: boolean) {
    super(message)
    this.isInvalidCredentials = isInvalidCredentials
  }
}

type Credentials = {
  email: string
  password: string
}

async function signIn({ email, password }: Credentials): Promise<void> {
  const supabase = await getSupabase()
  if (!supabase) throw new SignInError('Supabase is not configured', false)
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new SignInError(error.message, error.code === INVALID_CREDENTIALS_CODE)
}

export function useSignIn() {
  return useMutation({ mutationFn: signIn })
}
