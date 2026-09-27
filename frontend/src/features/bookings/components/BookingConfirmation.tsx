import { buttonClasses } from '../../../components/ui/buttonStyles'
import { Kernel } from '../../../components/ui/Kernel'

const EVENT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
}

function formatEventDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', EVENT_DATE_FORMAT)
}

type Props = {
  reference: string
  packageName: string
  eventDate: string
  onStartOver: () => void
}

export function BookingConfirmation({ reference, packageName, eventDate, onStartOver }: Props) {
  return (
    <div role="status" className="py-6 text-center">
      <Kernel className="mx-auto size-16" />
      <h3 className="mt-4 font-display text-4xl">Request sent</h3>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed">
        We'll call or email within a day to confirm {packageName} on {formatEventDate(eventDate)}.
      </p>
      <p className="mt-6 text-sm font-semibold text-ink/70">Your reference number</p>
      <p className="mt-1 font-display text-3xl tracking-wide text-cherry">{reference}</p>
      <button type="button" onClick={onStartOver} className={buttonClasses('secondary', 'mt-8')}>
        Book another event
      </button>
    </div>
  )
}
