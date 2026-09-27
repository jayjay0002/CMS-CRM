import { SECTION_IDS, type SectionId } from '@/shared/config'

import { FLAVOR_COLORS, type FlavorColor, SECTION_TYPES, type SectionType } from '../model/types'

type SectionMeta = {
  // Shown in the admin panel.
  label: string
  // Page anchor, if the section can be linked to.
  anchorId: SectionId | null
  // Header link label, if the section appears in the site navigation.
  navLabel: string | null
}

export const SECTION_META: Record<SectionType, SectionMeta> = {
  [SECTION_TYPES.hero]: { label: 'Hero (top of the page)', anchorId: SECTION_IDS.top, navLabel: null },
  [SECTION_TYPES.eventTypes]: { label: 'Event types strip', anchorId: null, navLabel: null },
  [SECTION_TYPES.packagesMenu]: { label: 'Packages menu', anchorId: SECTION_IDS.packages, navLabel: 'Packages' },
  [SECTION_TYPES.howItWorks]: {
    label: 'How booking works',
    anchorId: SECTION_IDS.howItWorks,
    navLabel: 'How it works',
  },
  [SECTION_TYPES.flavors]: { label: 'Flavors', anchorId: SECTION_IDS.flavors, navLabel: 'Flavors' },
  [SECTION_TYPES.faq]: { label: 'FAQ', anchorId: SECTION_IDS.faq, navLabel: 'FAQ' },
  [SECTION_TYPES.booking]: { label: 'Booking form', anchorId: SECTION_IDS.book, navLabel: null },
}

// Every "Book" button scrolls to the booking section, and the page needs a top.
export const ALWAYS_VISIBLE_SECTIONS: ReadonlySet<SectionType> = new Set([
  SECTION_TYPES.hero,
  SECTION_TYPES.booking,
])

export const FLAVOR_COLOR_OPTIONS: Record<FlavorColor, { label: string; className: string }> = {
  [FLAVOR_COLORS.butter]: { label: 'Butter yellow', className: 'bg-butter text-ink' },
  [FLAVOR_COLORS.kernel]: { label: 'Popcorn white', className: 'bg-kernel text-ink' },
  [FLAVOR_COLORS.caramel]: { label: 'Caramel', className: 'bg-caramel text-kernel' },
  [FLAVOR_COLORS.butterSoft]: { label: 'Pale yellow', className: 'bg-butter-soft text-ink' },
  [FLAVOR_COLORS.ink]: { label: 'Navy', className: 'bg-ink text-butter' },
  [FLAVOR_COLORS.cherry]: { label: 'Cherry red', className: 'bg-cherry text-kernel' },
}
