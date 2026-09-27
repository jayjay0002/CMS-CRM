import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { buttonClasses, Field, fieldAria, FormMessage, INPUT_CLASSES } from '@/shared/ui'

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../config/constants'
import { useSetNewPassword } from '../model/mutations'

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
      .max(MAX_PASSWORD_LENGTH, `Use at most ${MAX_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type NewPasswordValues = z.infer<typeof newPasswordSchema>

type Props = {
  onPasswordSet: () => void
  submitLabel?: string
}

export function SetNewPasswordForm({ onPasswordSet, submitLabel = 'Save new password' }: Props) {
  const setNewPassword = useSetNewPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(({ password }) => {
    setNewPassword.mutate(password, { onSuccess: onPasswordSet })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="New password" htmlFor="new-password" error={errors.password?.message}>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          autoFocus
          className={INPUT_CLASSES}
          {...fieldAria('new-password', errors.password?.message)}
          {...register('password')}
        />
      </Field>
      <Field label="Repeat new password" htmlFor="confirm-password" error={errors.confirmPassword?.message}>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          className={INPUT_CLASSES}
          {...fieldAria('confirm-password', errors.confirmPassword?.message)}
          {...register('confirmPassword')}
        />
      </Field>

      {setNewPassword.isError && (
        <FormMessage tone="error">
          Couldn't save your new password. {setNewPassword.error.message}
        </FormMessage>
      )}

      <button type="submit" disabled={setNewPassword.isPending} className={buttonClasses('primary', 'w-full py-4 text-lg')}>
        {setNewPassword.isPending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
