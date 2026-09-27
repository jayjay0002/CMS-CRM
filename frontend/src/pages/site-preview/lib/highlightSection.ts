import { scrollBehavior } from '@/shared/lib'
import { findLandingSection } from '@/widgets/landing-page'

// A thick cherry outline drawn inside the section, so it isn't clipped by neighbours.
const HIGHLIGHT_CLASSES = ['outline-4', 'outline-offset-[-4px]', 'outline-cherry'] as const
const HIGHLIGHT_MS = 1600

const activeTimers = new WeakMap<HTMLElement, number>()

// Returns false if the section isn't on the page (yet).
export function scrollToAndHighlight(sectionId: number): boolean {
  const element = findLandingSection(sectionId)
  if (!element) return false

  element.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
  element.classList.add(...HIGHLIGHT_CLASSES)

  window.clearTimeout(activeTimers.get(element))
  activeTimers.set(
    element,
    window.setTimeout(() => element.classList.remove(...HIGHLIGHT_CLASSES), HIGHLIGHT_MS),
  )
  return true
}
