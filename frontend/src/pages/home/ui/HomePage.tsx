import { Fragment, type ReactNode, useState } from 'react'

import {
  SECTION_META,
  SECTION_TYPES,
  type SectionContentMap,
  type SectionType,
  type SiteSection,
  type SiteSettings,
  useSite,
} from '@/entities/site'
import { buttonClasses, Kernel } from '@/shared/ui'
import { BookingSection } from '@/widgets/booking-section'
import { EventTypesStrip } from '@/widgets/event-types-strip'
import { Faq } from '@/widgets/faq'
import { Flavors } from '@/widgets/flavors'
import { Hero } from '@/widgets/hero'
import { HowItWorks } from '@/widgets/how-it-works'
import { PackagesMenu } from '@/widgets/packages-menu'
import { SiteFooter } from '@/widgets/site-footer'
import { type NavLink, SiteHeader } from '@/widgets/site-header'

const DEFAULT_BOOK_LABEL = 'Book now'

// What every section widget may need besides its own content.
type SectionContext = {
  settings: SiteSettings
  visibleTypes: ReadonlySet<SectionType>
  selectedPackageSlug: string | null
  onChoosePackage: (slug: string) => void
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
  [SECTION_TYPES.booking]: (content, { settings, selectedPackageSlug }) => (
    <BookingSection content={content} settings={settings} selectedPackageSlug={selectedPackageSlug} />
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

function PageStatus({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-butter px-5 text-center text-ink">
      <div className="flex flex-col items-center gap-5">{children}</div>
    </main>
  )
}

export function HomePage() {
  const [selectedPackageSlug, setSelectedPackageSlug] = useState<string | null>(null)
  const { data: site, isPending, isError, refetch, isRefetching } = useSite()

  if (isPending) {
    return (
      <PageStatus>
        <Kernel className="size-16 animate-bounce" />
        <p role="status" className="font-display text-2xl">
          Popping the page…
        </p>
      </PageStatus>
    )
  }

  if (isError) {
    return (
      <PageStatus>
        <Kernel className="size-16" />
        <p role="alert" className="font-display text-2xl">
          The page didn't load.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className={buttonClasses('primary')}
        >
          {isRefetching ? 'Trying again…' : 'Try again'}
        </button>
      </PageStatus>
    )
  }

  const context: SectionContext = {
    settings: site.settings,
    visibleTypes: new Set(site.sections.map((section) => section.type)),
    selectedPackageSlug,
    onChoosePackage: setSelectedPackageSlug,
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
          <Fragment key={section.type}>{renderSection(section, context)}</Fragment>
        ))}
      </main>
      <SiteFooter settings={site.settings} />
    </>
  )
}
