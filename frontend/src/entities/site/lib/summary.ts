import { SECTION_META } from '../config/sections'
import { type AdminSection, CUSTOM_SECTION_TYPES, SECTION_TYPES, type SectionType } from '../model/types'

const CUSTOM: ReadonlySet<SectionType> = new Set(CUSTOM_SECTION_TYPES)

// The name to show for a section. Custom sections can repeat, so their heading tells them apart.
export function sectionTitle(section: AdminSection): string {
  const { label } = SECTION_META[section.type]
  if (!CUSTOM.has(section.type) || !('heading' in section.content)) return label
  return `${label}: ${section.content.heading}`
}

function count(items: readonly unknown[], singular: string, plural: string): string {
  return `${items.length} ${items.length === 1 ? singular : plural}`
}

// One line describing a section's current content, for the admin sections list.
export function sectionSummary(section: AdminSection): string {
  switch (section.type) {
    case SECTION_TYPES.hero:
      return section.content.headline.replace(/\n/g, ' ')
    case SECTION_TYPES.eventTypes:
      return count(section.content.items, 'event type', 'event types')
    case SECTION_TYPES.packagesMenu:
      return section.content.heading
    case SECTION_TYPES.howItWorks:
      return `${section.content.heading}, ${count(section.content.steps, 'step', 'steps')}`
    case SECTION_TYPES.flavors:
      return count(section.content.items, 'flavor', 'flavors')
    case SECTION_TYPES.faq:
      return count(section.content.items, 'question', 'questions')
    case SECTION_TYPES.booking:
    case SECTION_TYPES.text:
    case SECTION_TYPES.cta:
      return section.content.heading
    case SECTION_TYPES.story:
      return `${section.content.heading}${section.content.image ? ', with photo' : ''}`
    case SECTION_TYPES.gallery:
      return `${section.content.heading}, ${count(section.content.images, 'photo', 'photos')}`
  }
}
