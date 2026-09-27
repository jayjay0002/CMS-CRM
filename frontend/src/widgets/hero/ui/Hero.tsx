import { BookButton } from '@/features/start-booking'
import { SECTION_IDS } from '@/shared/config'
import { buttonClasses } from '@/shared/ui'

import { PopcornCart } from './PopcornCart'

const HIGHLIGHTS = ['Setup and cleanup included', 'Popped fresh in front of guests', 'All over metro Atlanta']

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-butter">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-20 md:px-8 lg:grid-cols-[1.4fr_1fr] lg:pt-16 lg:pb-28">
        <div>
          <h1 className="font-display text-[2.6rem] leading-[1.08] text-ink [text-shadow:3px_3px_0_var(--color-cherry)] sm:text-6xl sm:[text-shadow:4px_4px_0_var(--color-cherry)] lg:text-[4.1rem] xl:text-7xl">
            <span className="block animate-rise">Fresh popcorn,</span>
            <span className="block animate-rise [animation-delay:120ms]">popped right</span>
            <span className="block animate-rise [animation-delay:240ms]">at your party.</span>
          </h1>
          <p className="mt-7 max-w-xl animate-rise text-lg leading-relaxed [animation-delay:360ms] md:text-xl">
            We roll our vintage popcorn cart to weddings, birthdays and office parties across metro
            Atlanta, and pop it fresh while your guests watch.
          </p>
          <div className="mt-9 flex animate-rise flex-wrap items-center gap-4 [animation-delay:480ms]">
            <BookButton className="px-8 py-4 text-lg">Book the cart</BookButton>
            <a href={`#${SECTION_IDS.packages}`} className={buttonClasses('secondary', 'px-8 py-4 text-lg')}>
              See packages
            </a>
          </div>
          <ul className="mt-9 flex animate-rise flex-wrap gap-x-6 gap-y-2 font-semibold [animation-delay:600ms]">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-2.5 rounded-full bg-cherry" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative isolate mx-auto w-full max-w-sm animate-roll-in [animation-delay:200ms] sm:max-w-md">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 aspect-square w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[repeating-conic-gradient(var(--color-butter-soft)_0deg_9deg,var(--color-butter)_9deg_18deg)]"
          />
          <PopcornCart className="w-full drop-shadow-[8px_8px_0_rgb(28_31_74/0.25)]" />
        </div>
      </div>
    </section>
  )
}
