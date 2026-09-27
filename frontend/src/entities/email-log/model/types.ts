// GET /admin/bookings/{id}/emails (snake_case, matching app/modules/notifications).

export const EMAIL_TEMPLATES = {
  bookingReceived: 'booking_received',
  bookingApproved: 'booking_approved',
  bookingDeclined: 'booking_declined',
  proposalSent: 'proposal_sent',
  proposalResponse: 'proposal_response',
} as const

export type EmailTemplate = (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES]

export const EMAIL_STATUSES = {
  sent: 'sent',
  failed: 'failed',
  // Email delivery isn't set up (no RESEND_API_KEY): logged, not sent.
  skipped: 'skipped',
} as const

export type EmailStatus = (typeof EMAIL_STATUSES)[keyof typeof EMAIL_STATUSES]

export type EmailLogEntry = {
  id: number
  template: EmailTemplate
  to_address: string
  subject: string
  status: EmailStatus
  error: string | null
  created_at: string
}
