import type { Camelize } from '@/shared/lib'

// Mirrors app/modules/content on the backend (enums.py and schemas.py).

export const SECTION_TYPES = {
  hero: 'hero',
  eventTypes: 'event_types',
  packagesMenu: 'packages_menu',
  howItWorks: 'how_it_works',
  flavors: 'flavors',
  faq: 'faq',
  booking: 'booking',
} as const

export type SectionType = (typeof SECTION_TYPES)[keyof typeof SECTION_TYPES]

export const FLAVOR_COLORS = {
  butter: 'butter',
  kernel: 'kernel',
  caramel: 'caramel',
  butterSoft: 'butter_soft',
  ink: 'ink',
  cherry: 'cherry',
} as const

export type FlavorColor = (typeof FLAVOR_COLORS)[keyof typeof FLAVOR_COLORS]

// --- API shapes (snake_case) ---

export type SiteSettingsDto = {
  business_name: string
  tagline: string
  phone_display: string
  phone_e164: string
  email: string | null
  instagram_handle: string | null
  instagram_url: string | null
  service_area: string
}

export type SectionContentDtoMap = {
  [SECTION_TYPES.hero]: {
    headline: string
    description: string
    primary_cta_label: string
    secondary_cta_label: string
    highlights: string[]
  }
  [SECTION_TYPES.eventTypes]: { items: string[] }
  [SECTION_TYPES.packagesMenu]: { heading: string; description: string }
  [SECTION_TYPES.howItWorks]: {
    heading: string
    steps: { title: string; body: string }[]
    cta_label: string
  }
  [SECTION_TYPES.flavors]: {
    heading: string
    description: string
    items: { name: string; color: FlavorColor }[]
  }
  [SECTION_TYPES.faq]: {
    heading: string
    intro: string
    items: { question: string; answer: string }[]
  }
  [SECTION_TYPES.booking]: { heading: string; description: string; phone_prompt: string }
}

export type SiteSectionDto<T extends SectionType = SectionType> = {
  [K in T]: { type: K; content: SectionContentDtoMap[K] }
}[T]

export type AdminSectionDto<T extends SectionType = SectionType> = {
  [K in T]: { type: K; position: number; is_visible: boolean; content: SectionContentDtoMap[K] }
}[T]

export type SiteDto = {
  settings: SiteSettingsDto
  sections: SiteSectionDto[]
}

// --- App shapes (camelCase) ---

export type SiteSettings = Camelize<SiteSettingsDto>

export type SectionContentMap = { [T in SectionType]: Camelize<SectionContentDtoMap[T]> }

export type HeroContent = SectionContentMap[typeof SECTION_TYPES.hero]
export type EventTypesContent = SectionContentMap[typeof SECTION_TYPES.eventTypes]
export type PackagesMenuContent = SectionContentMap[typeof SECTION_TYPES.packagesMenu]
export type HowItWorksContent = SectionContentMap[typeof SECTION_TYPES.howItWorks]
export type FlavorsContent = SectionContentMap[typeof SECTION_TYPES.flavors]
export type FaqContent = SectionContentMap[typeof SECTION_TYPES.faq]
export type BookingContent = SectionContentMap[typeof SECTION_TYPES.booking]

export type SiteSection<T extends SectionType = SectionType> = {
  [K in T]: { type: K; content: SectionContentMap[K] }
}[T]

export type AdminSection<T extends SectionType = SectionType> = {
  [K in T]: { type: K; position: number; isVisible: boolean; content: SectionContentMap[K] }
}[T]

export type Site = {
  settings: SiteSettings
  sections: SiteSection[]
}
