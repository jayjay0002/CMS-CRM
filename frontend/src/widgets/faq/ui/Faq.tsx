import { BUSINESS, FAQS, SECTION_IDS } from '@/shared/config'

export function Faq() {
  return (
    <section id={SECTION_IDS.faq} className="scroll-mt-20 bg-kernel py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:px-8 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="font-display text-5xl text-ink md:text-6xl">Good questions</h2>
          <p className="mt-4 text-lg">
            Something else on your mind? Call us at{' '}
            <a href={BUSINESS.phoneHref} className="font-bold underline decoration-cherry decoration-2 underline-offset-4">
              {BUSINESS.phoneDisplay}
            </a>
            .
          </p>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border-2 border-ink bg-white shadow-sign">
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
