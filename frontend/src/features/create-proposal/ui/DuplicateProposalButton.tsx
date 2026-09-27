import { useNavigate } from 'react-router'

import { saveErrorMessage } from '@/shared/api'
import { adminProposalPath } from '@/shared/config'
import { FormMessage } from '@/shared/ui'

import { useDuplicateProposal } from '../model/mutations'

const DEFAULT_CLASSES =
  'rounded-full border-2 border-ink bg-white px-4 py-1.5 text-sm font-semibold hover:bg-butter-soft disabled:opacity-50'

type Props = {
  proposalId: number
  label?: string
  className?: string
}

// Copies a proposal into a new, editable draft and opens it.
export function DuplicateProposalButton({ proposalId, label = 'Duplicate', className = DEFAULT_CLASSES }: Props) {
  const navigate = useNavigate()
  const duplicate = useDuplicateProposal()

  return (
    <span className="inline-flex flex-col gap-2">
      <button
        type="button"
        onClick={() => duplicate.mutate(proposalId, { onSuccess: (draft) => navigate(adminProposalPath(draft.id)) })}
        disabled={duplicate.isPending}
        className={className}
      >
        {duplicate.isPending ? 'Copying…' : label}
      </button>
      {duplicate.isError && <FormMessage tone="error">{saveErrorMessage(duplicate.error)}</FormMessage>}
    </span>
  )
}
