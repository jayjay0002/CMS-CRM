import { CTA_TARGETS, type CtaContent } from '@/entities/site'
import { BookButton } from '@/features/start-booking'
import { buttonClasses } from '@/shared/ui'

type Props = {
  anchorId: string
  content: CtaContent
  onBook: () => void
}

const BUTTON_SIZE = 'px-8 py-4 text-lg'

export function CallToAction({ anchorId, content, onBook }: Props) {
  const opensLink = content.buttonTarget === CTA_TARGETS.url && content.buttonUrl

  return (
    <section
      id={anchorId}
      className="relative isolate scroll-mt-20 overflow-hidden border-y-4 border-ink bg-cherry py-16 text-kernel md:py-20"
    >
      {/* The hero's sunburst, in the band's own reds, turning as the band scrolls past. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 -right-48 -z-10 aspect-square w-[40rem] -translate-y-1/2 rounded-full bg-[repeating-conic-gradient(var(--color-cherry)_0deg_9deg,var(--color-cherry-deep)_9deg_18deg)] spin-through md:-right-24"
      />
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
          <BookButton variant="onDark" onBook={onBook} className={`${BUTTON_SIZE} shrink-0`}>
            {content.buttonLabel}
          </BookButton>
        )}
      </div>
    </section>
  )
}
