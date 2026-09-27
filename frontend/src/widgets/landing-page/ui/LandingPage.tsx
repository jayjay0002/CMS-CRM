import { type ReactNode, useState } from 'react'

import {
  SECTION_META,
  SECTION_TYPES,
  type SectionContentMap,
  type SectionType,
  type Site,
  type SiteSection,
  type SiteSettings,
} from '@/entities/site'

import { LANDING_SECTION_ATTRIBUTE } from '../config/anchors'
import { BookingSection } from './sections/BookingSection'
import { EventTypesStrip } from './sections/EventTypesStrip'
import { Faq } from './sections/Faq'
import { Flavors } from './sections/Flavors'
import { Hero } from './sections/Hero'
import { HowItWorks } from './sections/HowItWorks'
import { PackagesMenu } from './sections/PackagesMenu'
import { SiteFooter } from './sections/SiteFooter'
import { type NavLink, SiteHeader } from './sections/SiteHeader'

const DEFAULT_BOOK_LABEL = 'Book now'

// What every section widget may need besides its own content.
type SectionContext = {
  settings: SiteSettings
  visibleTypes: ReadonlySet<SectionType>
  selectedPackageSlug: string | null
  onChoosePackage: (slug: string) => void
  isPreview: boolean
}

type SectionRenderer<T extends SectionType> = (content: SectionContentMap[T], context: SectionContext) => ReactNode

const SECTION_WIDGETS: { [T in SectionType]: SectionRenderer<T> } = {
  [SECTION_TYPES.hero]: (content, { visibleTypes }) => (
    <Hero content={content} showPackagesLink={visibleTypes.has(SECTION_TYPES.packagesMenu)} />
  ),
  [SECTION_TYPES.eventTypes]: (content) => <EventTypesStrip content={content} />,
  [SECTION_TYPES.packagesMenu]: (content, { settings, onChoosePackage }) => (
    <PackagesMenu content={content} contactPhone={settings.phoneDisplay} onChoosePackage={onChoosePackage} />
  ),
  [SECTION_TYPES.howItWorks]: (content) => <HowItWorks content={content} />,
  [SECTION_TYPES.flavors]: (content) => <Flavors content={content} />,
  [SECTION_TYPES.faq]: (content, { settings }) => <Faq content={content} settings={settings} />,
  [SECTION_TYPES.booking]: (content, { settings, selectedPackageSlug, isPreview }) => (
    <BookingSection
      content={content}
      settings={settings}
      selectedPackageSlug={selectedPackageSlug}
      isPreview={isPreview}
    />
  ),
}

function renderSection<T extends SectionType>(section: SiteSection<T>, context: SectionContext): ReactNode {
  const render: SectionRenderer<T> = SECTION_WIDGETS[section.type]
  return render(section.content, context)
}

function navLinksFor(sections: readonly SiteSection[]): NavLink[] {
  return sections.flatMap(({ type }) => {
    const { navLabel, anchorId } = SECTION_META[type]
    return navLabel && anchorId ? [{ label: navLabel, sectionId: anchorId }] : []
  })
}

// Header button label: the hero's main call to action (the hero is always visible).
function bookLabelFor(sections: readonly SiteSection[]): string {
  const hero = sections.find((section) => section.type === SECTION_TYPES.hero)
  return hero?.type === SECTION_TYPES.hero ? hero.content.primaryCtaLabel : DEFAULT_BOOK_LABEL
}

type Props = {
  site: Site
  // Admin preview: same page, but the booking form can't send real requests.
  isPreview?: boolean
}

// The whole public landing page, rendered from CMS content.
export function LandingPage({ site, isPreview = false }: Props) {
  const [selectedPackageSlug, setSelectedPackageSlug] = useState<string | null>(null)

  const context: SectionContext = {
    settings: site.settings,
    visibleTypes: new Set(site.sections.map((section) => section.type)),
    selectedPackageSlug,
    onChoosePackage: setSelectedPackageSlug,
    isPreview,
  }

  return (
    <>
      <SiteHeader
        businessName={site.settings.businessName}
        navLinks={navLinksFor(site.sections)}
        bookLabel={bookLabelFor(site.sections)}
      />
      <main>
        {site.sections.map((section) => (
          // The wrapper lets the builder preview find and highlight a section by type.
          <div key={section.type} {...{ [LANDING_SECTION_ATTRIBUTE]: section.type }} className="scroll-mt-20">
            {renderSection(section, context)}
          </div>
        ))}
      </main>
      <SiteFooter settings={site.settings} />
    </>
  )
}
