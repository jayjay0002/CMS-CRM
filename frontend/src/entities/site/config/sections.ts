import { SECTION_IDS, type SectionId } from '@/shared/config'

import {
  type CustomSectionType,
  FLAVOR_COLORS,
  type FlavorColor,
  SECTION_TYPES,
  type SectionType,
} from '../model/types'

type SectionMeta = {
  // Shown in the admin panel.
  label: string
  // Fixed page anchor for built-in sections; custom sections get `section-<id>`.
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
  [SECTION_TYPES.story]: { label: 'Story', anchorId: null, navLabel: null },
  [SECTION_TYPES.gallery]: { label: 'Photo gallery', anchorId: null, navLabel: null },
  [SECTION_TYPES.timeline]: { label: 'Restoration timeline', anchorId: null, navLabel: null },
  [SECTION_TYPES.text]: { label: 'Text', anchorId: null, navLabel: null },
  [SECTION_TYPES.cta]: { label: 'Call to action', anchorId: null, navLabel: null },
}

// The "+ Add section" menu, in the order it's shown.
export const CUSTOM_SECTION_OPTIONS: readonly { type: CustomSectionType; description: string }[] = [
  { type: SECTION_TYPES.story, description: 'Text with a photo, great for your history.' },
  { type: SECTION_TYPES.gallery, description: 'A grid of photos from your events, with captions.' },
  { type: SECTION_TYPES.timeline, description: 'Photo chapters that tell how something came to be.' },
  { type: SECTION_TYPES.text, description: 'A heading and paragraphs, nothing else.' },
  { type: SECTION_TYPES.cta, description: 'A bold band with one button: book, or open a link.' },
]

const CUSTOM_SECTION_ID_PREFIX = 'section-'

// The element id a section's anchor uses on the page.
export function sectionAnchorId(section: { id: number; type: SectionType }): string {
  return SECTION_META[section.type].anchorId ?? `${CUSTOM_SECTION_ID_PREFIX}${section.id}`
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
