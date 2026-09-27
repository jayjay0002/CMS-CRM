import { type AdminSection, SECTION_TYPES } from '../model/types'

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
      return section.content.heading
  }
}
