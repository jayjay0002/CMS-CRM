import { CTA_TARGETS, type CtaContent } from '@/entities/site'
import { BookButton } from '@/features/start-booking'
import { buttonClasses } from '@/shared/ui'

type Props = {
  anchorId: string
  content: CtaContent
}

const BUTTON_SIZE = 'px-8 py-4 text-lg'

export function CallToAction({ anchorId, content }: Props) {
  const opensLink = content.buttonTarget === CTA_TARGETS.url && content.buttonUrl

  return (
    <section id={anchorId} className="scroll-mt-20 border-y-4 border-ink bg-cherry py-16 text-kernel md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl [text-shadow:3px_3px_0_var(--color-ink)] md:text-5xl">{content.heading}</h2>
          {content.body && <p className="mt-4 text-lg leading-relaxed">{content.body}</p>}
        </div>
        {opensLink ? (
          <a
            href={content.buttonUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses('onDark', `${BUTTON_SIZE} shrink-0`)}
          >
            {content.buttonLabel}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <BookButton variant="onDark" className={`${BUTTON_SIZE} shrink-0`}>
            {content.buttonLabel}
          </BookButton>
        )}
      </div>
    </section>
  )
}
