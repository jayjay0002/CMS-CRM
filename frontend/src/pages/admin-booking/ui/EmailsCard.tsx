import {
  EMAIL_STATUS_EXPLANATIONS,
  EMAIL_TEMPLATE_LABELS,
  type EmailLogEntry,
  EmailStatusBadge,
  useBookingEmails,
} from '@/entities/email-log'

const CARD = 'rounded-3xl border-4 border-ink bg-white p-6 shadow-sign md:p-8'
const RETRY_BUTTON = 'rounded-full border-2 border-ink bg-white px-4 py-1.5 font-semibold hover:bg-butter-soft'

const sentAtFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

function EmailRow({ email }: { email: EmailLogEntry }) {
  const explanation = EMAIL_STATUS_EXPLANATIONS[email.status]
  return (
    <li className="flex flex-col gap-2 border-b border-ink/15 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-0.5">
        <p className="font-semibold">{EMAIL_TEMPLATE_LABELS[email.template]}</p>
        <p className="text-sm break-words text-ink/75">
          To {email.to_address} · “{email.subject}”
        </p>
        <p className="text-sm text-ink/60">
          <time dateTime={email.created_at}>{sentAtFormatter.format(new Date(email.created_at))}</time>
        </p>
        {explanation && <p className="text-sm text-ink/70">{explanation}</p>}
      </div>
      <EmailStatusBadge status={email.status} />
    </li>
  )
}

export function EmailsCard({ bookingId }: { bookingId: number }) {
  const emails = useBookingEmails(bookingId)

  function renderBody() {
    if (emails.isPending) {
      return (
        <div role="status" className="h-16 animate-pulse rounded-2xl bg-ink/10">
          <span className="sr-only">Loading emails…</span>
        </div>
      )
    }
    if (emails.isError) {
      return (
        <div role="alert" className="space-y-2">
          <p>Couldn’t load the email history.</p>
          <button type="button" onClick={() => emails.refetch()} className={RETRY_BUTTON}>
            Try again
          </button>
        </div>
      )
    }
    if (emails.data.length === 0) return <p className="text-ink/70">No emails for this booking yet.</p>
    return (
      <ul>
        {emails.data.map((email) => (
          <EmailRow key={email.id} email={email} />
        ))}
      </ul>
    )
  }

  return (
    <section aria-labelledby="emails-heading" className={CARD}>
      <h2 id="emails-heading" className="font-display text-2xl">Emails</h2>
      <p className="mt-1 text-sm text-ink/65">Everything sent about this booking, newest first.</p>
      <div className="mt-4">{renderBody()}</div>
    </section>
  )
}
