import type { BookingContent, SiteSettings } from '@/entities/site'
import { BookingForm } from '@/features/book-cart'
import { SECTION_IDS } from '@/shared/config'
import { telHref } from '@/shared/lib'

type Props = {
  content: BookingContent
  settings: SiteSettings
  selectedPackageSlug: string | null
}

export function BookingSection({ content, settings, selectedPackageSlug }: Props) {
  return (
    <section id={SECTION_IDS.book} className="scroll-mt-20 bg-cherry py-20 text-kernel md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="font-display text-5xl [text-shadow:4px_4px_0_var(--color-ink)] md:text-6xl">
            {content.heading}
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed md:text-xl">{content.description}</p>
          <p className="mt-8 text-lg">
            {content.phonePrompt}
            <br />
            <a href={telHref(settings.phoneE164)} className="font-display text-3xl hover:text-butter">
              {settings.phoneDisplay}
            </a>
          </p>
        </div>
        <div className="relative rounded-3xl border-4 border-ink bg-kernel p-6 text-ink shadow-sign-lg md:p-9">
          <BookingForm selectedPackageSlug={selectedPackageSlug} contactPhone={settings.phoneDisplay} />
        </div>
      </div>
    </section>
  )
}
