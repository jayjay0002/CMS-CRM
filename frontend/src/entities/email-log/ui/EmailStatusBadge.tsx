import { EMAIL_STATUS_BADGE_CLASSES, EMAIL_STATUS_LABELS } from '../config/emails'
import type { EmailStatus } from '../model/types'

export function EmailStatusBadge({ status }: { status: EmailStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-bold whitespace-nowrap ${EMAIL_STATUS_BADGE_CLASSES[status]}`}
    >
      {EMAIL_STATUS_LABELS[status]}
    </span>
  )
}
