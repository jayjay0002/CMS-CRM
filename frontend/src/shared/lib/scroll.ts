import { MEDIA_QUERIES } from './useMediaQuery'

export function prefersReducedMotion(): boolean {
  return window.matchMedia(MEDIA_QUERIES.reducedMotion).matches
}

export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth'
}

export function scrollToSection(sectionId: string, delayMs = 0): void {
  const scroll = () => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: scrollBehavior() })
  }

  if (delayMs === 0 || prefersReducedMotion()) {
    scroll()
    return
  }
  window.setTimeout(scroll, delayMs)
}
