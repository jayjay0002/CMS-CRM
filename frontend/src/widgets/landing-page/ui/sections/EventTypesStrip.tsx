import type { EventTypesContent } from '@/entities/site'
import { Kernel } from '@/shared/ui'

// Each ticker track repeats the event names until it holds at least this many, so a short
// list still spans wide screens without a gap at the seam.
const MIN_TICKER_ITEMS = 10
// Two identical tracks scroll in step: as the first leaves, the second takes its place.
const TICKER_TRACKS = 2

function tickerItems(items: readonly string[]): string[] {
  const repeats = Math.ceil(MIN_TICKER_ITEMS / items.length)
  return Array.from({ length: repeats }, () => items).flat()
}

type Props = {
  content: EventTypesContent
}

export function EventTypesStrip({ content }: Props) {
  if (content.items.length === 0) return null
  const trackItems = tickerItems(content.items)

  return (
    <section aria-labelledby="event-types-heading" className="overflow-hidden border-y-2 border-ink bg-ink">
      <h2 id="event-types-heading" className="sr-only">
        Events we pop for
      </h2>
      {/* The readable list: hidden visually behind the ticker, shown as a still row for reduced motion. */}
      <ul className="sr-only font-display text-xl text-kernel motion-reduce:not-sr-only motion-reduce:mx-auto motion-reduce:flex motion-reduce:max-w-6xl motion-reduce:flex-wrap motion-reduce:items-center motion-reduce:justify-center motion-reduce:gap-x-5 motion-reduce:gap-y-3 motion-reduce:px-5 motion-reduce:py-7 md:text-2xl">
        {content.items.map((eventType, index) => (
          <li key={`${index}-${eventType}`} className="flex items-center gap-5">
            {index > 0 && <Kernel className="size-6" />}
            {eventType}
          </li>
        ))}
      </ul>
      {/* Paused on hover so a visitor can read a name. */}
      <div aria-hidden="true" className="group flex py-7 font-display text-xl text-kernel motion-reduce:hidden md:text-2xl">
        {Array.from({ length: TICKER_TRACKS }, (_, track) => (
          <ul key={track} className="flex shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]">
            {trackItems.map((eventType, index) => (
              <li key={`${index}-${eventType}`} className="flex items-center gap-5 pl-5 whitespace-nowrap">
                <Kernel className="size-6" />
                {eventType}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}
