import { buttonClasses, Kernel } from '@/shared/ui'

const EVENT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
}

// Popcorn that bursts out of the kernel when the request goes through (read by the `burst`
// keyframes): the moment the visitor finishes booking deserves one.
const CELEBRATION_PIECES = [
  { id: 'left', className: '[--bx:-110px] [--by:-30px] [--br:-140deg]' },
  { id: 'up-left', className: '[--bx:-80px] [--by:-95px] [--br:-60deg]' },
  { id: 'up', className: '[--bx:-8px] [--by:-130px] [--br:120deg]' },
  { id: 'up-right', className: '[--bx:85px] [--by:-100px] [--br:200deg]' },
  { id: 'right', className: '[--bx:115px] [--by:-35px] [--br:80deg]' },
  { id: 'high-left', className: '[--bx:-45px] [--by:-150px] [--br:160deg]' },
  { id: 'high-right', className: '[--bx:40px] [--by:-155px] [--br:-120deg]' },
] as const

function Celebration() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {CELEBRATION_PIECES.map((piece) => (
        <Kernel key={piece.id} className={`absolute size-9 animate-burst ${piece.className}`} />
      ))}
    </span>
  )
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
      <div className="relative mx-auto size-16">
        <Kernel className="size-16 animate-rise" />
        <Celebration />
      </div>
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
