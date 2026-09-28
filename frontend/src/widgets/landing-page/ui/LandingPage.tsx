import { type ReactNode, useState } from 'react'

import {
  SECTION_META,
  SECTION_TYPES,
  sectionAnchorId,
  type SectionContentMap,
  type SectionType,
  type Site,
  type SiteSection,
  type SiteSettings,
  useApplySiteTheme,
} from '@/entities/site'

import { LANDING_SECTION_ATTRIBUTE } from '../config/anchors'
import { BookingDialog } from './BookingDialog'
import { BookingSection } from './sections/BookingSection'
import { CallToAction } from './sections/CallToAction'
import { EventTypesStrip } from './sections/EventTypesStrip'
import { Faq } from './sections/Faq'
import { Flavors } from './sections/Flavors'
import { Gallery } from './sections/Gallery'
import { Hero } from './sections/Hero'
import { HowItWorks } from './sections/HowItWorks'
import { PackagesMenu } from './sections/PackagesMenu'
import { SiteFooter } from './sections/SiteFooter'
import { type NavLink, SiteHeader } from './sections/SiteHeader'
import { Story } from './sections/Story'
import { TextBlock } from './sections/TextBlock'

const DEFAULT_BOOK_LABEL = 'Book now'
const DEFAULT_BOOKING_HEADING = 'Book the cart'

// What every section widget may need besides its own content.
type SectionContext = {
  anchorId: string
  settings: SiteSettings
  visibleTypes: ReadonlySet<SectionType>
  selectedPackageSlug: string | null
  // Opens the booking dialog, with a package already picked when one is given.
  onBook: (packageSlug?: string) => void
  isPreview: boolean
}

type SectionRenderer<T extends SectionType> = (content: SectionContentMap[T], context: SectionContext) => ReactNode

const SECTION_WIDGETS: { [T in SectionType]: SectionRenderer<T> } = {
  [SECTION_TYPES.hero]: (content, { visibleTypes, onBook }) => (
    <Hero content={content} showPackagesLink={visibleTypes.has(SECTION_TYPES.packagesMenu)} onBook={onBook} />
  ),
  [SECTION_TYPES.eventTypes]: (content) => <EventTypesStrip content={content} />,
  [SECTION_TYPES.packagesMenu]: (content, { settings, onBook }) => (
    <PackagesMenu content={content} contactPhone={settings.phoneDisplay} onBook={onBook} />
  ),
  [SECTION_TYPES.howItWorks]: (content, { onBook }) => <HowItWorks content={content} onBook={onBook} />,
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
  [SECTION_TYPES.story]: (content, { anchorId }) => <Story anchorId={anchorId} content={content} />,
  [SECTION_TYPES.gallery]: (content, { anchorId }) => <Gallery anchorId={anchorId} content={content} />,
  [SECTION_TYPES.text]: (content, { anchorId }) => <TextBlock anchorId={anchorId} content={content} />,
  [SECTION_TYPES.cta]: (content, { anchorId, onBook }) => (
    <CallToAction anchorId={anchorId} content={content} onBook={onBook} />
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

function bookingHeadingFor(sections: readonly SiteSection[]): string {
  const booking = sections.find((section) => section.type === SECTION_TYPES.booking)
  return booking?.type === SECTION_TYPES.booking ? booking.content.heading : DEFAULT_BOOKING_HEADING
}

type Props = {
  site: Site
  // Admin preview: same page, but the booking form can't send real requests.
  isPreview?: boolean
  // Wraps each rendered section, e.g. with the builder's move controls.
  renderSectionFrame?: (section: SiteSection, children: ReactNode) => ReactNode
}

// The whole public landing page, rendered from CMS content in the site's theme.
export function LandingPage({ site, isPreview = false, renderSectionFrame }: Props) {
  const [selectedPackageSlug, setSelectedPackageSlug] = useState<string | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  useApplySiteTheme(site.theme)

  function openBooking(packageSlug?: string) {
    if (packageSlug) setSelectedPackageSlug(packageSlug)
    setIsBookingOpen(true)
  }

  const baseContext = {
    settings: site.settings,
    visibleTypes: new Set(site.sections.map((section) => section.type)),
    selectedPackageSlug,
    onBook: openBooking,
    isPreview,
  }

  return (
    <>
      <SiteHeader
        businessName={site.settings.businessName}
        navLinks={navLinksFor(site.sections)}
        bookLabel={bookLabelFor(site.sections)}
        onBook={openBooking}
      />
      <main>
        {site.sections.map((section) => {
          const rendered = renderSection(section, { ...baseContext, anchorId: sectionAnchorId(section) })
          return (
            // The wrapper lets the builder preview find and highlight a section by id.
            <div key={section.id} {...{ [LANDING_SECTION_ATTRIBUTE]: section.id }} className="scroll-mt-20">
              {renderSectionFrame ? renderSectionFrame(section, rendered) : rendered}
            </div>
          )
        })}
      </main>
      <SiteFooter settings={site.settings} />
      <BookingDialog
        isOpen={isBookingOpen}
        heading={bookingHeadingFor(site.sections)}
        contactPhone={site.settings.phoneDisplay}
        selectedPackageSlug={selectedPackageSlug}
        isPreview={isPreview}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  )
}
