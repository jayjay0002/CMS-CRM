import { useState } from 'react'

import { BookingSection } from './components/landing/BookingSection'
import { EventTypesStrip } from './components/landing/EventTypesStrip'
import { Faq } from './components/landing/Faq'
import { Flavors } from './components/landing/Flavors'
import { Hero } from './components/landing/Hero'
import { HowItWorks } from './components/landing/HowItWorks'
import { PackagesMenu } from './components/landing/PackagesMenu'
import { SiteFooter } from './components/landing/SiteFooter'
import { SiteHeader } from './components/landing/SiteHeader'
import { SAMPLE_PACKAGES } from './features/packages/samplePackages'

function App() {
  const [selectedPackageSlug, setSelectedPackageSlug] = useState<string | null>(null)

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <EventTypesStrip />
        <PackagesMenu packages={SAMPLE_PACKAGES} onChoosePackage={setSelectedPackageSlug} />
        <HowItWorks />
        <Flavors />
        <Faq />
        <BookingSection packages={SAMPLE_PACKAGES} selectedPackageSlug={selectedPackageSlug} />
      </main>
      <SiteFooter />
    </>
  )
}

export default App
