import { EVENT_TYPES } from '@/shared/config'
import { Kernel } from '@/shared/ui'

export function EventTypesStrip() {
  return (
    <section aria-labelledby="event-types-heading" className="border-y-2 border-ink bg-ink">
      <h2 id="event-types-heading" className="sr-only">
        Events we pop for
      </h2>
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-3 px-5 py-7 font-display text-xl text-kernel md:text-2xl">
        {EVENT_TYPES.map((eventType, index) => (
          <li key={eventType} className="flex items-center gap-5">
            {index > 0 && <Kernel className="size-6" />}
            {eventType}
          </li>
        ))}
      </ul>
    </section>
  )
}
