import { z } from 'zod'

import { BODY_FONTS, HEADING_FONTS, HEX_COLOR_PATTERN, type Theme } from '@/entities/site'

const hexColor = z.string().trim().regex(HEX_COLOR_PATTERN, 'Use a color like #d7263d')

export const themeSchema = z.object({
  colors: z.object({
    background: hexColor,
    surface: hexColor,
    surfaceSoft: hexColor,
    text: hexColor,
    primary: hexColor,
    primaryDark: hexColor,
    accent: hexColor,
  }),
  headingFont: z.enum(HEADING_FONTS),
  bodyFont: z.enum(BODY_FONTS),
})

export type ThemeFormValues = z.infer<typeof themeSchema>

export function isHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value)
}

// For the live preview: half-typed colors fall back to the last saved ones instead of breaking the page.
export function draftTheme(values: ThemeFormValues, saved: Theme): Theme {
  const colors = Object.fromEntries(
    Object.entries(values.colors).map(([role, value]) => [
      role,
      isHexColor(value) ? value : saved.colors[role as keyof Theme['colors']],
    ]),
  ) as Theme['colors']
  return { ...values, colors }
}
