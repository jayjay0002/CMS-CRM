import { type RefObject, useEffect, useRef } from 'react'

import { MEDIA_QUERIES, useMediaQuery } from '@/shared/lib'

// CSS custom properties the parallax layers read, each from -1 (left/top) to 1 (right/bottom).
const POINTER_X_VARIABLE = '--pointer-x'
const POINTER_Y_VARIABLE = '--pointer-y'

// Maps a position inside a box to -1..1, with 0 at the center.
function centeredRatio(position: number, start: number, size: number): number {
  return ((position - start) / size) * 2 - 1
}

// Tracks the pointer over an element and exposes its position as CSS variables, so layers
// can shift by their own depth. Writes straight to the element's style (no re-renders) once
// per frame, and stays off for touch screens and visitors who prefer reduced motion.
export function usePointerParallax<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null)
  const hasFinePointer = useMediaQuery(MEDIA_QUERIES.finePointer)
  const prefersReducedMotion = useMediaQuery(MEDIA_QUERIES.reducedMotion)
  const isEnabled = hasFinePointer && !prefersReducedMotion

  useEffect(() => {
    const element = ref.current
    if (!isEnabled || !element) return undefined
    let frame = 0

    function setPointer(x: number, y: number) {
      element?.style.setProperty(POINTER_X_VARIABLE, String(x))
      element?.style.setProperty(POINTER_Y_VARIABLE, String(y))
    }

    function handleMove(event: PointerEvent) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!element) return
        const bounds = element.getBoundingClientRect()
        setPointer(
          centeredRatio(event.clientX, bounds.left, bounds.width),
          centeredRatio(event.clientY, bounds.top, bounds.height),
        )
      })
    }

    function handleLeave() {
      cancelAnimationFrame(frame)
      setPointer(0, 0)
    }

    element.addEventListener('pointermove', handleMove)
    element.addEventListener('pointerleave', handleLeave)
    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('pointermove', handleMove)
      element.removeEventListener('pointerleave', handleLeave)
      element.style.removeProperty(POINTER_X_VARIABLE)
      element.style.removeProperty(POINTER_Y_VARIABLE)
    }
  }, [isEnabled])

  return ref
}
