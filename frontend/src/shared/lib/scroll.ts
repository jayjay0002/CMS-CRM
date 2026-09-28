import { MEDIA_QUERIES } from './useMediaQuery'

export function prefersReducedMotion(): boolean {
  return window.matchMedia(MEDIA_QUERIES.reducedMotion).matches
}

export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth'
}
