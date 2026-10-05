import type { TimelineContent } from '@/entities/site'

type Chapter = TimelineContent['chapters'][number]

type ChapterProps = {
  chapter: Chapter
  // Even chapters put the photo on the left on wide screens, odd ones on the right.
  isPhotoFirst: boolean
}

function TimelineChapter({ chapter, isPhotoFirst }: ChapterProps) {
  return (
    <li className="relative grid items-center gap-6 pl-12 lg:grid-cols-2 lg:gap-24 lg:pl-0">
      {/* A stamp on the pinstripe marks where each chapter starts. */}
      <span
        aria-hidden="true"
        className="absolute top-2 left-1.5 size-6 rounded-full border-4 border-ink bg-butter shadow-[0_0_0_3px_var(--color-butter)] reveal reveal-pop lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
      />
      <figure className={`reveal reveal-pin ${isPhotoFirst ? 'lg:order-1' : 'lg:order-2'}`}>
        <img
          src={chapter.image.url}
          alt={chapter.image.alt}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-2xl border-4 border-butter object-cover shadow-[10px_10px_0_var(--color-cherry)]"
        />
      </figure>
      <div className={`reveal ${isPhotoFirst ? 'lg:order-2' : 'lg:order-1'}`}>
        <p className="text-sm font-bold tracking-widest text-butter uppercase">{chapter.kicker}</p>
        <h3 className="mt-2 font-display text-3xl text-kernel md:text-4xl">{chapter.title}</h3>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-kernel/85">{chapter.body}</p>
      </div>
    </li>
  )
}

type Props = {
  anchorId: string
  content: TimelineContent
}

// The restoration told in chapters along a gold pinstripe, like the ones painted on the wagon.
export function Timeline({ anchorId, content }: Props) {
  return (
    <section id={anchorId} className="section-anchor overflow-hidden bg-ink py-14 text-kernel md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <header className="mx-auto max-w-3xl lg:text-center">
          <h2 className="font-display text-5xl text-butter md:text-6xl">{content.heading}</h2>
          {content.intro && <p className="mt-4 text-lg leading-relaxed text-kernel/85">{content.intro}</p>}
        </header>
        <div className="relative mt-12 md:mt-16">
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-4 w-1 rounded-full bg-butter reveal reveal-draw-down lg:left-1/2 lg:-translate-x-1/2"
          />
          <ol className="space-y-16 md:space-y-24">
            {content.chapters.map((chapter, index) => (
              <TimelineChapter
                key={`${index}-${chapter.image.url}`}
                chapter={chapter}
                isPhotoFirst={index % 2 === 0}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
