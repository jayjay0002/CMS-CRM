import { useCallback, useSyncExternalStore } from 'react'

// Match Tailwind's breakpoints (rem-based, like the CSS).
export const MEDIA_QUERIES = {
  desktop: '(min-width: 64rem)',
  // Wide enough for an editor panel and a readable preview side by side.
  wide: '(min-width: 80rem)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  // A mouse or trackpad, not touch: pointer-following effects only make sense here.
  finePointer: '(hover: hover) and (pointer: fine)',
} as const

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}
