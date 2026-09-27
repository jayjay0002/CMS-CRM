import { EMAIL_STATUSES, EMAIL_TEMPLATES, type EmailStatus, type EmailTemplate } from '../model/types'

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplate, string> = {
  [EMAIL_TEMPLATES.bookingReceived]: 'Booking received',
  [EMAIL_TEMPLATES.bookingApproved]: 'Booking approved',
  [EMAIL_TEMPLATES.bookingDeclined]: 'Booking declined',
  [EMAIL_TEMPLATES.proposalSent]: 'Proposal sent',
  [EMAIL_TEMPLATES.proposalResponse]: 'Proposal response to you',
}

export const EMAIL_STATUS_LABELS: Record<EmailStatus, string> = {
  [EMAIL_STATUSES.sent]: 'Sent',
  [EMAIL_STATUSES.failed]: 'Failed',
  [EMAIL_STATUSES.skipped]: 'Not sent',
}

export const EMAIL_STATUS_BADGE_CLASSES: Record<EmailStatus, string> = {
  [EMAIL_STATUSES.sent]: 'border-2 border-ink bg-ink text-kernel',
  [EMAIL_STATUSES.failed]: 'border-2 border-cherry-deep bg-cherry/10 text-cherry-deep',
  [EMAIL_STATUSES.skipped]: 'border-2 border-dashed border-ink/40 bg-white text-ink/70',
}

// Shown next to skipped emails so nobody thinks the customer got them.
export const EMAIL_STATUS_EXPLANATIONS: Partial<Record<EmailStatus, string>> = {
  [EMAIL_STATUSES.skipped]: 'Not sent — email isn’t set up yet.',
  [EMAIL_STATUSES.failed]: 'The email service rejected this message.',
}
