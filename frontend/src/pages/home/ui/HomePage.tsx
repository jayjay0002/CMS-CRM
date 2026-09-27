import { useState } from 'react'

import { BookingSection } from '@/widgets/booking-section'
import { EventTypesStrip } from '@/widgets/event-types-strip'
import { Faq } from '@/widgets/faq'
import { Flavors } from '@/widgets/flavors'
import { Hero } from '@/widgets/hero'
import { HowItWorks } from '@/widgets/how-it-works'
import { PackagesMenu } from '@/widgets/packages-menu'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

export function HomePage() {
  const [selectedPackageSlug, setSelectedPackageSlug] = useState<string | null>(null)

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <EventTypesStrip />
        <PackagesMenu onChoosePackage={setSelectedPackageSlug} />
        <HowItWorks />
        <Flavors />
        <Faq />
        <BookingSection selectedPackageSlug={selectedPackageSlug} />
      </main>
      <SiteFooter />
    </>
  )
}
