import { type RefObject, useEffect, useState } from 'react'

export type ElementSize = { width: number; height: number }

const EMPTY_SIZE: ElementSize = { width: 0, height: 0 }

// Content-box size of an element, kept up to date as it resizes.
export function useElementSize(ref: RefObject<HTMLElement | null>): ElementSize {
  const [size, setSize] = useState<ElementSize>(EMPTY_SIZE)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return size
}
