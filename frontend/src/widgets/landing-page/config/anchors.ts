import type { SectionType } from '@/entities/site'

// Every rendered section is wrapped in an element carrying its type under this attribute.
export const LANDING_SECTION_ATTRIBUTE = 'data-section-type'

export function findLandingSection(type: SectionType): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${LANDING_SECTION_ATTRIBUTE}="${type}"]`)
}
