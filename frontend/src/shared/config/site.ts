// Fixed page anchors. Everything the owner can edit (text, lists, business info) comes from the
// CMS API instead; see entities/site.
export const SECTION_IDS = {
  top: 'top',
  packages: 'packages',
  howItWorks: 'how-it-works',
  flavors: 'flavors',
  faq: 'faq',
  book: 'book',
} as const

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS]
