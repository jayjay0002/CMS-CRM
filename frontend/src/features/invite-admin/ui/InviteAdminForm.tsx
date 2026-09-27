import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { ADMIN_ROLE_OPTIONS, ADMIN_ROLES, SignInLinkBox } from '@/entities/admin'
import { saveErrorMessage } from '@/shared/api'
import { buttonClasses, Field, fieldAria, FormMessage, INPUT_CLASSES } from '@/shared/ui'

import { type InviteAdminValues, inviteAdminSchema } from '../model/schema'
import { useInviteAdmin } from '../model/useInviteAdmin'

const EMPTY_INVITE: InviteAdminValues = { email: '', fullName: '', role: ADMIN_ROLES.staff }

export function InviteAdminForm() {
  const invite = useInviteAdmin()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteAdminValues>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: EMPTY_INVITE,
  })

  const onSubmit = handleSubmit((values) => {
    invite.mutate(
      { email: values.email, full_name: values.fullName, role: values.role },
      { onSuccess: () => reset(EMPTY_INVITE) },
    )
  })

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Email" htmlFor="invite-email" error={errors.email?.message}>
            <input
              id="invite-email"
              type="email"
              autoComplete="off"
              className={INPUT_CLASSES}
              {...fieldAria('invite-email', errors.email?.message)}
              {...register('email')}
            />
          </Field>
          <Field label="Full name" htmlFor="invite-name" error={errors.fullName?.message}>
            <input
              id="invite-name"
              autoComplete="off"
              className={INPUT_CLASSES}
              {...fieldAria('invite-name', errors.fullName?.message)}
              {...register('fullName')}
            />
          </Field>
        </div>

        <fieldset>
          <legend className="mb-2 font-semibold">Role</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ADMIN_ROLE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="cursor-pointer rounded-2xl border-2 border-ink bg-white p-4 has-checked:bg-butter has-checked:shadow-sign has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink"
              >
                <input type="radio" value={option.value} className="sr-only" {...register('role')} />
                <span className="block font-bold">{option.label}</span>
                <span className="mt-1 block text-sm text-ink/75">{option.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {invite.isError && <FormMessage tone="error">{saveErrorMessage(invite.error)}</FormMessage>}

        <button type="submit" disabled={invite.isPending} className={buttonClasses('primary')}>
          {invite.isPending ? 'Creating invite…' : 'Create invite link'}
        </button>
      </form>

      {invite.isSuccess && (
        <SignInLinkBox
          link={invite.data.invite_link}
          recipientName={invite.data.admin.full_name}
          onDismiss={() => invite.reset()}
        />
      )}
    </div>
  )
}
