function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function scrollToSection(sectionId: string, delayMs = 0): void {
  const scroll = () => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  if (delayMs === 0 || prefersReducedMotion()) {
    scroll()
    return
  }
  window.setTimeout(scroll, delayMs)
}
