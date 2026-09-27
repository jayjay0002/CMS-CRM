import type { FaqContent, SiteSettings } from '@/entities/site'
import { SECTION_IDS } from '@/shared/config'
import { telHref } from '@/shared/lib'

type Props = {
  content: FaqContent
  settings: SiteSettings
}

export function Faq({ content, settings }: Props) {
  return (
    <section id={SECTION_IDS.faq} className="scroll-mt-20 bg-kernel py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:px-8 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="font-display text-5xl text-ink md:text-6xl">{content.heading}</h2>
          <p className="mt-4 text-lg">
            {content.intro && `${content.intro} `}
            <a
              href={telHref(settings.phoneE164)}
              className="font-bold underline decoration-cherry decoration-2 underline-offset-4"
            >
              {settings.phoneDisplay}
            </a>
          </p>
        </div>
        <div className="space-y-4">
          {content.items.map((faq, index) => (
            <details key={`${index}-${faq.question}`} className="group rounded-2xl border-2 border-ink bg-white shadow-sign">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-lg font-bold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-butter font-display text-xl transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="px-6 pb-6 leading-relaxed text-ink/85">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
