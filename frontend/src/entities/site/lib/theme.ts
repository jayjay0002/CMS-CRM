import { useEffect } from 'react'

import { LIGHT_LUMINANCE_THRESHOLD, relativeLuminance } from '@/shared/lib'

import {
  BODY_FONT_FALLBACKS,
  CARD_CSS_VARIABLE,
  FONT_CSS_VARIABLES,
  HEADING_FONT_FALLBACKS,
  LIGHT_CARD_COLOR,
  THEME_COLOR_ROLE_ORDER,
  THEME_COLOR_ROLES,
} from '../config/theme'
import type { BodyFont, HeadingFont, Theme } from '../model/types'

const GOOGLE_FONTS_CSS_URL = 'https://fonts.googleapis.com/css2'
// Marks <link> tags we add, so each family is only requested once.
const FONT_LINK_ATTRIBUTE = 'data-theme-font'
// Weights the site uses; display fonts only ship one weight, which Google serves for 400.
const BODY_FONT_WEIGHTS = '400;500;600;700;800'

function quoted(family: string): string {
  return `'${family}'`
}

export function headingFontStack(font: HeadingFont): string {
  return `${quoted(font)}, ${HEADING_FONT_FALLBACKS[font]}`
}

export function bodyFontStack(font: BodyFont): string {
  return `${quoted(font)}, ${BODY_FONT_FALLBACKS[font]}`
}

// CSS custom properties that re-theme every Tailwind utility using the site tokens.
export function themeCssVariables(theme: Theme): Record<string, string> {
  const colors = Object.fromEntries(
    THEME_COLOR_ROLE_ORDER.map((role) => [THEME_COLOR_ROLES[role].cssVariable, theme.colors[role]]),
  )
  const isLight = relativeLuminance(theme.colors.background) >= LIGHT_LUMINANCE_THRESHOLD
  return {
    ...colors,
    [CARD_CSS_VARIABLE]: isLight ? LIGHT_CARD_COLOR : theme.colors.background,
    [FONT_CSS_VARIABLES.heading]: headingFontStack(theme.headingFont),
    [FONT_CSS_VARIABLES.body]: bodyFontStack(theme.bodyFont),
  }
}

function googleFontHref(family: string, weights: string | null): string {
  const familyParam = family.replaceAll(' ', '+')
  const axis = weights ? `:wght@${weights}` : ''
  return `${GOOGLE_FONTS_CSS_URL}?family=${familyParam}${axis}&display=swap`
}

// Adds a stylesheet link for a Google Font family unless one is already on the page.
export function loadGoogleFont(family: string, kind: 'heading' | 'body'): void {
  const selector = `link[${FONT_LINK_ATTRIBUTE}="${family}"]`
  if (document.head.querySelector(selector)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = googleFontHref(family, kind === 'body' ? BODY_FONT_WEIGHTS : null)
  link.setAttribute(FONT_LINK_ATTRIBUTE, family)
  document.head.append(link)
}

// Applies the theme to the whole document while the public page (or its preview) is mounted,
// and removes it again on the way out so the admin panel keeps its own colors.
export function useApplySiteTheme(theme: Theme | null): void {
  const variables = theme ? themeCssVariables(theme) : null
  // A string, so the effect only re-runs when a value actually changes.
  const signature = variables ? JSON.stringify(variables) : ''
  const headingFont = theme?.headingFont ?? null
  const bodyFont = theme?.bodyFont ?? null

  useEffect(() => {
    if (headingFont) loadGoogleFont(headingFont, 'heading')
    if (bodyFont) loadGoogleFont(bodyFont, 'body')
  }, [headingFont, bodyFont])

  useEffect(() => {
    if (!signature) return undefined
    const entries = Object.entries(JSON.parse(signature) as Record<string, string>)
    const root = document.documentElement
    for (const [name, value] of entries) root.style.setProperty(name, value)
    return () => {
      for (const [name] of entries) root.style.removeProperty(name)
    }
  }, [signature])
}
