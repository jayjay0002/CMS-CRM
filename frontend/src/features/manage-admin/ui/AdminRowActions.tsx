import { useState } from 'react'

import { ADMIN_ROLE_LABELS, ADMIN_ROLES, type AdminListItem, SignInLinkBox } from '@/entities/admin'
import { saveErrorMessage } from '@/shared/api'
import { FormMessage } from '@/shared/ui'

import { useSignInLink, useUpdateAdmin } from '../model/mutations'

const ACTION_BUTTON =
  'rounded-full border-2 border-ink bg-white px-4 py-1.5 text-sm font-semibold hover:bg-butter-soft disabled:cursor-not-allowed disabled:opacity-50'
const DANGER_BUTTON =
  'rounded-full border-2 border-cherry-deep bg-cherry px-4 py-1.5 text-sm font-semibold text-kernel hover:bg-cherry-deep'

type Props = {
  admin: AdminListItem
  isSelf: boolean
}

export function AdminRowActions({ admin, isSelf }: Props) {
  const updateAdmin = useUpdateAdmin(admin.id)
  const signInLink = useSignInLink(admin.id)
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false)

  const otherRole = admin.role === ADMIN_ROLES.owner ? ADMIN_ROLES.staff : ADMIN_ROLES.owner
  const isBusy = updateAdmin.isPending || signInLink.isPending
  const failure = updateAdmin.error ?? signInLink.error

  if (isSelf) {
    return (
      <p className="text-sm text-ink/70">
        This is you. Another owner can change your role or access.
      </p>
    )
  }

  function deactivate() {
    updateAdmin.mutate({ is_active: false }, { onSettled: () => setIsConfirmingDeactivate(false) })
  }

  return (
    <div className="space-y-3">
      {isConfirmingDeactivate ? (
        <div role="group" aria-label={`Confirm deactivating ${admin.full_name}`} className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">
            Deactivate {admin.full_name}? They’ll lose access right away.
          </p>
          <button type="button" onClick={deactivate} disabled={isBusy} className={DANGER_BUTTON}>
            Yes, deactivate
          </button>
          <button type="button" onClick={() => setIsConfirmingDeactivate(false)} className={ACTION_BUTTON}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {admin.is_active && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => updateAdmin.mutate({ role: otherRole })}
              className={ACTION_BUTTON}
            >
              Make {ADMIN_ROLE_LABELS[otherRole].toLowerCase()}
            </button>
          )}
          {admin.is_active ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setIsConfirmingDeactivate(true)}
              className={ACTION_BUTTON}
            >
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => updateAdmin.mutate({ is_active: true })}
              className={ACTION_BUTTON}
            >
              Reactivate
            </button>
          )}
          <button
            type="button"
            disabled={isBusy || !admin.is_active}
            title={admin.is_active ? undefined : 'Reactivate them first'}
            onClick={() => signInLink.mutate()}
            className={ACTION_BUTTON}
          >
            Get sign-in link
          </button>
        </div>
      )}

      {failure && <FormMessage tone="error">{saveErrorMessage(failure)}</FormMessage>}
      {signInLink.isSuccess && (
        <SignInLinkBox
          link={signInLink.data.invite_link}
          recipientName={admin.full_name}
          onDismiss={() => signInLink.reset()}
        />
      )}
    </div>
  )
}
