// Every rendered section is wrapped in an element carrying its id under this attribute.
export const LANDING_SECTION_ATTRIBUTE = 'data-section-id'

export function findLandingSection(sectionId: number): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${LANDING_SECTION_ATTRIBUTE}="${sectionId}"]`)
}
