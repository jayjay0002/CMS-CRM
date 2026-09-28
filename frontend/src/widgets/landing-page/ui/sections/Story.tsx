import { IMAGE_SIDES, type StoryContent } from '@/entities/site'

import { paragraphs } from '../../lib/paragraphs'

type Props = {
  anchorId: string
  content: StoryContent
}

export function Story({ anchorId, content }: Props) {
  const { image } = content
  const imageFirst = image !== null && content.imageSide === IMAGE_SIDES.left

  return (
    <section id={anchorId} className="section-anchor bg-kernel py-14 md:py-28">
      <div
        className={`mx-auto grid items-center gap-12 px-5 md:px-8 ${image ? 'max-w-6xl lg:grid-cols-2' : 'max-w-3xl'}`}
      >
        <div className={imageFirst ? 'lg:order-2' : undefined}>
          <h2 className="font-display text-5xl text-ink md:text-6xl">{content.heading}</h2>
          <div className="mt-6 max-w-prose space-y-4 text-lg leading-relaxed text-ink/85">
            {paragraphs(content.body).map((paragraph, index) => (
              <p key={`paragraph-${index}`} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        {image && (
          <figure className={imageFirst ? 'lg:order-1' : undefined}>
            <img
              src={image.url}
              alt={image.alt}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-3xl border-4 border-ink object-cover shadow-sign-lg"
            />
          </figure>
        )}
      </div>
    </section>
  )
}
