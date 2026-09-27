import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { buttonClasses, Field, fieldAria, FormMessage, INPUT_CLASSES } from '@/shared/ui'

import { SignInError, useSignIn } from '../model/useSignIn'

const loginSchema = z.object({
  email: z.email('Enter the email you use for the admin panel'),
  password: z.string().min(1, 'Enter your password'),
})

type LoginValues = z.infer<typeof loginSchema>

function signInErrorMessage(error: Error): string {
  if (error instanceof SignInError && error.isInvalidCredentials) return 'Wrong email or password'
  return "Couldn't sign in. Check your connection and try again."
}

type Props = {
  onSignedIn: () => void
  onForgotPassword: () => void
}

export function LoginForm({ onSignedIn, onForgotPassword }: Props) {
  const signIn = useSignIn()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit((values) => {
    signIn.mutate(values, { onSuccess: onSignedIn })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          className={INPUT_CLASSES}
          {...fieldAria('email', errors.email?.message)}
          {...register('email')}
        />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password?.message}>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={INPUT_CLASSES}
          {...fieldAria('password', errors.password?.message)}
          {...register('password')}
        />
      </Field>
      <button
        type="button"
        onClick={onForgotPassword}
        className="font-semibold underline decoration-cherry decoration-2 underline-offset-4"
      >
        Forgot password?
      </button>

      {signIn.isError && <FormMessage tone="error">{signInErrorMessage(signIn.error)}</FormMessage>}

      <button type="submit" disabled={signIn.isPending} className={buttonClasses('primary', 'w-full py-4 text-lg')}>
        {signIn.isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
