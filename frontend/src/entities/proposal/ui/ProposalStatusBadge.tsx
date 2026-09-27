import { PROPOSAL_STATUS_BADGE_CLASSES, PROPOSAL_STATUS_LABELS } from '../config/proposals'
import { displayStatus } from '../lib/status'
import type { ProposalStatus } from '../model/types'

type Props = {
  proposal: { status: ProposalStatus; is_expired: boolean }
}

export function ProposalStatusBadge({ proposal }: Props) {
  const status = displayStatus(proposal)
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-bold whitespace-nowrap ${PROPOSAL_STATUS_BADGE_CLASSES[status]}`}
    >
      {PROPOSAL_STATUS_LABELS[status]}
    </span>
  )
}
