import { type CSSProperties, type ReactNode, useEffect } from 'react'

import { loadGoogleFont, themeCssVariables } from '../lib/theme'
import type { Theme } from '../model/types'

type Props = {
  theme: Theme | null
  className?: string
  children: ReactNode
}

// Applies the site theme to one part of the page only (e.g. a preview inside the admin panel),
// unlike useApplySiteTheme, which themes the whole document.
export function ThemeScope({ theme, className = '', children }: Props) {
  const headingFont = theme?.headingFont ?? null
  const bodyFont = theme?.bodyFont ?? null

  useEffect(() => {
    if (headingFont) loadGoogleFont(headingFont, 'heading')
    if (bodyFont) loadGoogleFont(bodyFont, 'body')
  }, [headingFont, bodyFont])

  // Theme colors and fonts are runtime values, so they can't be Tailwind classes: they're set as
  // CSS variables on this wrapper and every token utility inside picks them up.
  const variables = theme ? (themeCssVariables(theme) as CSSProperties) : undefined

  return (
    <div className={`bg-kernel font-sans text-ink ${className}`} style={variables}>
      {children}
    </div>
  )
}
