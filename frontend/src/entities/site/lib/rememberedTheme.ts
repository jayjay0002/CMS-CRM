import { HEX_COLOR_PATTERN } from '../config/limits'
import { THEME_COLOR_ROLE_ORDER } from '../config/theme'
import { BODY_FONTS, HEADING_FONTS, type Theme } from '../model/types'

// The last theme the public page showed, kept in this browser so the loading screen can wear
// the site's colors on the next visit instead of flashing the default palette.
const REMEMBERED_THEME_KEY = 'site-theme'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value)
}

function isOneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return options.some((option) => option === value)
}

// Stored data can be stale or tampered with, so only a complete, valid theme is used.
function isTheme(value: unknown): value is Theme {
  if (!isRecord(value) || !isRecord(value.colors)) return false
  const { colors } = value
  return (
    THEME_COLOR_ROLE_ORDER.every((role) => isHexColor(colors[role])) &&
    isOneOf(HEADING_FONTS, value.headingFont) &&
    isOneOf(BODY_FONTS, value.bodyFont)
  )
}

export function rememberSiteTheme(theme: Theme): void {
  try {
    localStorage.setItem(REMEMBERED_THEME_KEY, JSON.stringify(theme))
  } catch {
    // Storage can be full or blocked (private windows); the loader then uses default colors.
  }
}

export function readRememberedSiteTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(REMEMBERED_THEME_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    return isTheme(parsed) ? parsed : null
  } catch {
    return null
  }
}
