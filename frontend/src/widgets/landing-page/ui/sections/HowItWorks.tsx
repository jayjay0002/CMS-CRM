import type { HowItWorksContent } from '@/entities/site'
import { BookButton } from '@/features/start-booking'
import { SECTION_IDS } from '@/shared/config'

type Props = {
  content: HowItWorksContent
  onBook: () => void
}

export function HowItWorks({ content, onBook }: Props) {
  return (
    <section id={SECTION_IDS.howItWorks} className="section-anchor bg-kernel py-14 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <h2 className="font-display text-5xl text-ink md:text-6xl">{content.heading}</h2>
        <ol className="mt-10 grid gap-8 md:mt-12 md:grid-cols-3">
          {content.steps.map((step, index) => (
            <li key={`${index}-${step.title}`} className="reveal">
              {/* The rule above each step draws itself in, so the steps read as one path. */}
              <span aria-hidden="true" className="mb-5 block h-1 bg-ink reveal reveal-draw md:mb-6" />
              {/* Number beside the title on phones to save height; stacked above it on wider screens. */}
              <div className="flex items-center gap-4 md:block">
                <span
                  aria-hidden="true"
                  className="font-display text-5xl text-cherry [text-shadow:3px_3px_0_var(--color-ink)] md:text-6xl"
                >
                  {index + 1}
                </span>
                <h3 className="text-2xl font-bold md:mt-3">{step.title}</h3>
              </div>
              <p className="mt-2 max-w-sm text-lg leading-relaxed text-ink/80">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-col sm:block md:mt-14">
          <BookButton onBook={onBook} className="w-full px-8 py-4 text-lg sm:w-auto">
            {content.ctaLabel}
          </BookButton>
        </div>
      </div>
    </section>
  )
}
