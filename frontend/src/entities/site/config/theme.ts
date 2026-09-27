import type { BodyFont, HeadingFont, Theme, ThemeColorRole } from '../model/types'

// The launch look ("Classic Red Wagon"). Mirrors DEFAULT_THEME in the backend and the
// @theme tokens in app/styles/index.css.
export const DEFAULT_THEME: Theme = {
  colors: {
    background: '#fffdf4',
    surface: '#ffd447',
    surfaceSoft: '#fff1b8',
    text: '#1c1f4a',
    primary: '#d7263d',
    primaryDark: '#a61b2e',
    accent: '#b86a1f',
  },
  headingFont: 'Shrikhand',
  bodyFont: 'Bricolage Grotesque',
}

type ColorRoleMeta = {
  // The Tailwind theme variable this role replaces at runtime.
  cssVariable: string
  label: string
  description: string
}

// The one place that maps theme color roles to the site's design tokens.
export const THEME_COLOR_ROLES: Record<ThemeColorRole, ColorRoleMeta> = {
  background: {
    cssVariable: '--color-kernel',
    label: 'Page background',
    description: 'Behind most sections, and the text on buttons.',
  },
  surface: {
    cssVariable: '--color-butter',
    label: 'Header and hero',
    description: 'The top band and highlighted chips.',
  },
  surfaceSoft: {
    cssVariable: '--color-butter-soft',
    label: 'Soft band',
    description: 'Lighter blocks like the flavors section.',
  },
  text: {
    cssVariable: '--color-ink',
    label: 'Text and outlines',
    description: 'Headings, body text, borders and shadows.',
  },
  primary: {
    cssVariable: '--color-cherry',
    label: 'Buttons and accents',
    description: 'Book buttons, the menu band and the booking form.',
  },
  primaryDark: {
    cssVariable: '--color-cherry-deep',
    label: 'Dark accent',
    description: 'Deep shadows and error text.',
  },
  accent: {
    cssVariable: '--color-caramel',
    label: 'Warm accent',
    description: 'Popcorn outlines and caramel details.',
  },
}

export const THEME_COLOR_ROLE_ORDER: readonly ThemeColorRole[] = [
  'background',
  'surface',
  'surfaceSoft',
  'text',
  'primary',
  'primaryDark',
  'accent',
]

// Cards and form fields use Tailwind's white. On a dark theme they take the page background
// instead, so the (light) text on them stays readable.
export const CARD_CSS_VARIABLE = '--color-white'
export const LIGHT_CARD_COLOR = '#ffffff'

export const FONT_CSS_VARIABLES = {
  heading: '--font-display',
  body: '--font-sans',
} as const

// Fallbacks while a Google Font loads (or if it can't).
export const HEADING_FONT_FALLBACKS: Record<HeadingFont, string> = {
  Shrikhand: 'Georgia, serif',
  'Lilita One': 'ui-rounded, system-ui, sans-serif',
  'Titan One': 'ui-rounded, system-ui, sans-serif',
  'Bagel Fat One': 'ui-rounded, system-ui, sans-serif',
  'DM Serif Display': 'Georgia, serif',
  Fraunces: 'Georgia, serif',
}

export const BODY_FONT_FALLBACKS: Record<BodyFont, string> = {
  'Bricolage Grotesque': 'ui-sans-serif, system-ui, sans-serif',
  Nunito: 'ui-rounded, system-ui, sans-serif',
  'Work Sans': 'ui-sans-serif, system-ui, sans-serif',
  'DM Sans': 'ui-sans-serif, system-ui, sans-serif',
  Lora: 'Georgia, serif',
  Figtree: 'ui-sans-serif, system-ui, sans-serif',
}
