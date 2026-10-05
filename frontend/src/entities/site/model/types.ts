import type { Camelize } from '@/shared/lib'

// Mirrors app/modules/content on the backend (enums.py and schemas.py).

export const SECTION_TYPES = {
  // Built-in: one of each on the page; can be hidden but not deleted.
  hero: 'hero',
  eventTypes: 'event_types',
  packagesMenu: 'packages_menu',
  howItWorks: 'how_it_works',
  flavors: 'flavors',
  faq: 'faq',
  booking: 'booking',
  // Custom: the owner adds as many as they like and can delete them.
  story: 'story',
  gallery: 'gallery',
  timeline: 'timeline',
  text: 'text',
  cta: 'cta',
} as const

export type SectionType = (typeof SECTION_TYPES)[keyof typeof SECTION_TYPES]

export const CUSTOM_SECTION_TYPES = [
  SECTION_TYPES.story,
  SECTION_TYPES.gallery,
  SECTION_TYPES.timeline,
  SECTION_TYPES.text,
  SECTION_TYPES.cta,
] as const

export type CustomSectionType = (typeof CUSTOM_SECTION_TYPES)[number]

export const FLAVOR_COLORS = {
  butter: 'butter',
  kernel: 'kernel',
  caramel: 'caramel',
  butterSoft: 'butter_soft',
  ink: 'ink',
  cherry: 'cherry',
} as const

export type FlavorColor = (typeof FLAVOR_COLORS)[keyof typeof FLAVOR_COLORS]

export const IMAGE_SIDES = {
  left: 'left',
  right: 'right',
} as const

export type ImageSide = (typeof IMAGE_SIDES)[keyof typeof IMAGE_SIDES]

export const CTA_TARGETS = {
  book: 'book',
  url: 'url',
} as const

export type CtaTarget = (typeof CTA_TARGETS)[keyof typeof CTA_TARGETS]

export const HEADING_FONTS = [
  'Shrikhand',
  'Lilita One',
  'Titan One',
  'Bagel Fat One',
  'DM Serif Display',
  'Fraunces',
] as const

export type HeadingFont = (typeof HEADING_FONTS)[number]

export const BODY_FONTS = ['Bricolage Grotesque', 'Nunito', 'Work Sans', 'DM Sans', 'Lora', 'Figtree'] as const

export type BodyFont = (typeof BODY_FONTS)[number]

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

export type ThemeColorsDto = {
  background: string
  surface: string
  surface_soft: string
  text: string
  primary: string
  primary_dark: string
  accent: string
}

export type ThemeDto = {
  colors: ThemeColorsDto
  heading_font: HeadingFont
  body_font: BodyFont
}

export type ImageDto = { url: string; alt: string }

export type SectionContentDtoMap = {
  [SECTION_TYPES.hero]: {
    headline: string
    description: string
    primary_cta_label: string
    secondary_cta_label: string
    highlights: string[]
    // A photo instead of the drawn popcorn cart; null keeps the drawing.
    image: ImageDto | null
  }
  [SECTION_TYPES.eventTypes]: { items: string[] }
  [SECTION_TYPES.packagesMenu]: {
    heading: string
    description: string
    // Marked "Most popular" on the menu. Missing from content saved before the field existed.
    featured_package_slug?: string | null
  }
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
  [SECTION_TYPES.story]: {
    heading: string
    // Blank lines separate paragraphs.
    body: string
    image: ImageDto | null
    image_side: ImageSide
  }
  [SECTION_TYPES.gallery]: {
    heading: string
    intro: string
    images: (ImageDto & { caption: string })[]
  }
  [SECTION_TYPES.timeline]: {
    heading: string
    intro: string
    chapters: { kicker: string; title: string; body: string; image: ImageDto }[]
  }
  [SECTION_TYPES.text]: { heading: string; body: string }
  [SECTION_TYPES.cta]: {
    heading: string
    body: string
    button_label: string
    button_target: CtaTarget
    button_url: string | null
  }
}

export type SiteSectionDto<T extends SectionType = SectionType> = {
  [K in T]: { id: number; type: K; content: SectionContentDtoMap[K] }
}[T]

export type AdminSectionDto<T extends SectionType = SectionType> = {
  [K in T]: {
    id: number
    type: K
    position: number
    is_visible: boolean
    is_removable: boolean
    content: SectionContentDtoMap[K]
  }
}[T]

export type SiteDto = {
  settings: SiteSettingsDto
  theme: ThemeDto
  sections: SiteSectionDto[]
}

// --- App shapes (camelCase) ---

export type SiteSettings = Camelize<SiteSettingsDto>
export type Theme = Camelize<ThemeDto>
export type ThemeColors = Theme['colors']
export type ThemeColorRole = keyof ThemeColors
export type SiteImage = Camelize<ImageDto>

export type SectionContentMap = { [T in SectionType]: Camelize<SectionContentDtoMap[T]> }

export type HeroContent = SectionContentMap[typeof SECTION_TYPES.hero]
export type EventTypesContent = SectionContentMap[typeof SECTION_TYPES.eventTypes]
export type PackagesMenuContent = SectionContentMap[typeof SECTION_TYPES.packagesMenu]
export type HowItWorksContent = SectionContentMap[typeof SECTION_TYPES.howItWorks]
export type FlavorsContent = SectionContentMap[typeof SECTION_TYPES.flavors]
export type FaqContent = SectionContentMap[typeof SECTION_TYPES.faq]
export type BookingContent = SectionContentMap[typeof SECTION_TYPES.booking]
export type StoryContent = SectionContentMap[typeof SECTION_TYPES.story]
export type GalleryContent = SectionContentMap[typeof SECTION_TYPES.gallery]
export type TimelineContent = SectionContentMap[typeof SECTION_TYPES.timeline]
export type TextContent = SectionContentMap[typeof SECTION_TYPES.text]
export type CtaContent = SectionContentMap[typeof SECTION_TYPES.cta]

export type SiteSection<T extends SectionType = SectionType> = {
  [K in T]: { id: number; type: K; content: SectionContentMap[K] }
}[T]

export type AdminSection<T extends SectionType = SectionType> = {
  [K in T]: {
    id: number
    type: K
    position: number
    isVisible: boolean
    isRemovable: boolean
    content: SectionContentMap[K]
  }
}[T]

export type Site = {
  settings: SiteSettings
  theme: Theme
  sections: SiteSection[]
}
