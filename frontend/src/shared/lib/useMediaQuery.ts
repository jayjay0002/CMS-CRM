import { useCallback, useSyncExternalStore } from 'react'

// Match Tailwind's breakpoints (rem-based, like the CSS).
export const MEDIA_QUERIES = {
  desktop: '(min-width: 64rem)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
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
