import type { GalleryContent } from '@/entities/site'

type Props = {
  anchorId: string
  content: GalleryContent
}

export function Gallery({ anchorId, content }: Props) {
  return (
    <section id={anchorId} className="scroll-mt-20 border-y-2 border-ink bg-butter-soft py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <h2 className="font-display text-5xl text-ink md:text-6xl">{content.heading}</h2>
        {content.intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed">{content.intro}</p>}
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.images.map((image, index) => (
            <li key={`${index}-${image.url}`} className="reveal reveal-pin">
              <figure className="h-full overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-sign">
                <img src={image.url} alt={image.alt} loading="lazy" className="aspect-square w-full object-cover" />
                {image.caption && (
                  <figcaption className="border-t-2 border-ink px-4 py-3 font-semibold">{image.caption}</figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
