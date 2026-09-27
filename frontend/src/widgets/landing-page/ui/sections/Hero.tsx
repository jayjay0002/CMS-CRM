import type { HeroContent } from '@/entities/site'
import { BookButton } from '@/features/start-booking'
import { SECTION_IDS } from '@/shared/config'
import { buttonClasses } from '@/shared/ui'

import { PopcornCart } from './PopcornCart'

// Staggered entrance, one step per headline line (the headline allows up to 4 lines).
const HEADLINE_LINE_DELAYS = [
  '',
  '[animation-delay:120ms]',
  '[animation-delay:240ms]',
  '[animation-delay:360ms]',
] as const

function headlineLines(headline: string): string[] {
  return headline
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

type Props = {
  content: HeroContent
  // Hide "See packages" when the packages section is hidden, so it never links to nothing.
  showPackagesLink: boolean
}

export function Hero({ content, showPackagesLink }: Props) {
  return (
    <section id={SECTION_IDS.top} className="relative overflow-hidden bg-butter">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-20 md:px-8 lg:grid-cols-[1.4fr_1fr] lg:pt-16 lg:pb-28">
        <div>
          <h1 className="font-display text-[2.6rem] leading-[1.08] text-ink [text-shadow:3px_3px_0_var(--color-cherry)] sm:text-6xl sm:[text-shadow:4px_4px_0_var(--color-cherry)] lg:text-[4.1rem] xl:text-7xl">
            {headlineLines(content.headline).map((line, index) => (
              <span key={`${index}-${line}`} className={`block animate-rise ${HEADLINE_LINE_DELAYS[index] ?? ''}`}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-7 max-w-xl animate-rise text-lg leading-relaxed [animation-delay:360ms] md:text-xl">
            {content.description}
          </p>
          <div className="mt-9 flex animate-rise flex-wrap items-center gap-4 [animation-delay:480ms]">
            <BookButton className="px-8 py-4 text-lg">{content.primaryCtaLabel}</BookButton>
            {showPackagesLink && (
              <a href={`#${SECTION_IDS.packages}`} className={buttonClasses('secondary', 'px-8 py-4 text-lg')}>
                {content.secondaryCtaLabel}
              </a>
            )}
          </div>
          {content.highlights.length > 0 && (
            <ul className="mt-9 flex animate-rise flex-wrap gap-x-6 gap-y-2 font-semibold [animation-delay:600ms]">
              {content.highlights.map((highlight, index) => (
                <li key={`${index}-${highlight}`} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2.5 rounded-full bg-cherry" />
                  {highlight}
                </li>
              ))}
            </ul>
          )}
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
