import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { buttonClasses, Field, fieldAria, FormMessage, INPUT_CLASSES } from '@/shared/ui'

import { useRequestPasswordReset } from '../model/mutations'

const requestSchema = z.object({
  email: z.email('Enter the email you use for the admin panel'),
})

type RequestValues = z.infer<typeof requestSchema>

type Props = {
  onBackToSignIn: () => void
}

export function RequestResetForm({ onBackToSignIn }: Props) {
  const requestReset = useRequestPasswordReset()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(({ email }) => requestReset.mutate(email))

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Email" htmlFor="reset-email" error={errors.email?.message}>
        <input
          id="reset-email"
          type="email"
          autoComplete="username"
          autoFocus
          className={INPUT_CLASSES}
          {...fieldAria('reset-email', errors.email?.message)}
          {...register('email')}
        />
      </Field>

      {/* Same message whether or not the email exists, so this can't be used to find admin emails. */}
      {requestReset.isSuccess && (
        <FormMessage tone="success">
          If that email has an admin account, we've sent a reset link. Check your inbox.
        </FormMessage>
      )}
      {requestReset.isError && (
        <FormMessage tone="error">Couldn't send the reset email. Wait a minute and try again.</FormMessage>
      )}

      <button type="submit" disabled={requestReset.isPending} className={buttonClasses('primary', 'w-full py-4 text-lg')}>
        {requestReset.isPending ? 'Sending…' : 'Send reset link'}
      </button>
      <button
        type="button"
        onClick={onBackToSignIn}
        className="font-semibold underline decoration-cherry decoration-2 underline-offset-4"
      >
        Back to sign in
      </button>
    </form>
  )
}
