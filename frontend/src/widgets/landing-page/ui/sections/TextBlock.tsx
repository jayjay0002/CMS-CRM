import type { TextContent } from '@/entities/site'

import { paragraphs } from '../../lib/paragraphs'

type Props = {
  anchorId: string
  content: TextContent
}

export function TextBlock({ anchorId, content }: Props) {
  return (
    <section id={anchorId} className="section-anchor bg-kernel py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <h2 className="font-display text-4xl text-ink md:text-5xl">{content.heading}</h2>
        <div className="mt-6 max-w-prose space-y-4 text-lg leading-relaxed text-ink/85">
          {paragraphs(content.body).map((paragraph, index) => (
            <p key={`paragraph-${index}`} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
