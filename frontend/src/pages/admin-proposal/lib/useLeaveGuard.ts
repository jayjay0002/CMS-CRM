import { type MouseEvent, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

// Unsaved edits: warn on tab close/reload, and hold in-app link clicks for an in-page confirm.
export function useLeaveGuard(isDirty: boolean) {
  const navigate = useNavigate()
  const [pendingTarget, setPendingTarget] = useState<string | null>(null)

  useEffect(() => {
    if (!isDirty) return undefined
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  // onClick for in-app <Link>s that leave the editor.
  const guardLink = useCallback(
    (target: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (!isDirty) return
      event.preventDefault()
      setPendingTarget(target)
    },
    [isDirty],
  )

  const leave = useCallback(() => {
    if (pendingTarget) navigate(pendingTarget)
  }, [navigate, pendingTarget])

  const stay = useCallback(() => setPendingTarget(null), [])

  return { pendingTarget, guardLink, leave, stay }
}
