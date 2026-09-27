import { useNavigate } from 'react-router'

import { saveErrorMessage } from '@/shared/api'
import { adminProposalPath } from '@/shared/config'
import { buttonClasses, FormMessage } from '@/shared/ui'

import { useCreateProposal } from '../model/mutations'

type Props = {
  bookingId: number
}

export function CreateProposalButton({ bookingId }: Props) {
  const navigate = useNavigate()
  const create = useCreateProposal(bookingId)

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => create.mutate(undefined, { onSuccess: (draft) => navigate(adminProposalPath(draft.id)) })}
        disabled={create.isPending}
        className={buttonClasses('primary', 'px-5 py-2.5')}
      >
        {create.isPending ? 'Creating…' : 'Create proposal'}
      </button>
      {create.isError && <FormMessage tone="error">{saveErrorMessage(create.error)}</FormMessage>}
    </div>
  )
}
