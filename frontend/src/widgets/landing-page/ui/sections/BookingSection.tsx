import type { BookingContent, SiteSettings } from '@/entities/site'
import { BookingForm } from '@/features/book-cart'
import { SECTION_IDS } from '@/shared/config'
import { telHref } from '@/shared/lib'

type Props = {
  content: BookingContent
  settings: SiteSettings
  selectedPackageSlug: string | null
  isPreview: boolean
}

export function BookingSection({ content, settings, selectedPackageSlug, isPreview }: Props) {
  return (
    <section id={SECTION_IDS.book} className="section-anchor bg-cherry py-14 text-kernel md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:gap-12 md:px-8 lg:grid-cols-[1fr_1.6fr]">
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
        <div className="relative rounded-3xl border-4 border-ink bg-kernel p-5 text-ink shadow-sign md:p-9 md:shadow-sign-lg">
          <BookingForm
            selectedPackageSlug={selectedPackageSlug}
            contactPhone={settings.phoneDisplay}
            isPreview={isPreview}
          />
        </div>
      </div>
    </section>
  )
}
