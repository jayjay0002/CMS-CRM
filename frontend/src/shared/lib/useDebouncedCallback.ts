import { useEffect, useMemo, useRef } from 'react'

// Calls `callback` once the caller has stopped calling for `delayMs` (e.g. search-as-you-type).
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
): (...args: Args) => void {
  const callbackRef = useRef(callback)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  return useMemo(
    () =>
      (...args: Args) => {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current)
        timerRef.current = window.setTimeout(() => callbackRef.current(...args), delayMs)
      },
    [delayMs],
  )
}
