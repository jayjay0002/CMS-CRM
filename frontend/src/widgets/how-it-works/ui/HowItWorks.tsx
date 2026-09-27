import type { HowItWorksContent } from '@/entities/site'
import { BookButton } from '@/features/start-booking'
import { SECTION_IDS } from '@/shared/config'

type Props = {
  content: HowItWorksContent
}

export function HowItWorks({ content }: Props) {
  return (
    <section id={SECTION_IDS.howItWorks} className="scroll-mt-20 bg-kernel py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <h2 className="font-display text-5xl text-ink md:text-6xl">{content.heading}</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {content.steps.map((step, index) => (
            <li key={`${index}-${step.title}`} className="border-t-4 border-ink pt-6">
              <span
                aria-hidden="true"
                className="font-display text-6xl text-cherry [text-shadow:3px_3px_0_var(--color-ink)]"
              >
                {index + 1}
              </span>
              <h3 className="mt-3 text-2xl font-bold">{step.title}</h3>
              <p className="mt-2 max-w-sm text-lg leading-relaxed text-ink/80">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14">
          <BookButton className="px-8 py-4 text-lg">{content.ctaLabel}</BookButton>
        </div>
      </div>
    </section>
  )
}
