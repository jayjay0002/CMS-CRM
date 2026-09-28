import { type RefObject, useEffect, useRef } from 'react'

// Read by the stylesheet, which pauses looping animations inside a marked element.
const OFFSCREEN_ATTRIBUTE = 'data-offscreen'

// Marks the element while it's scrolled out of view, so its looping animations (popping
// kernels, marquee bulbs, the ticker) stop costing frames. Writes the attribute directly,
// with no React state, so scrolling never re-renders the section.
export function usePauseOffscreen<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      element.toggleAttribute(OFFSCREEN_ATTRIBUTE, entry ? !entry.isIntersecting : false)
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
      element.removeAttribute(OFFSCREEN_ATTRIBUTE)
    }
  }, [])

  return ref
}
