import type { ReactNode } from 'react'

import { buttonClasses, Kernel } from '@/shared/ui'

function StatusScreen({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-butter px-5 text-center text-ink">
      <div className="flex flex-col items-center gap-5">{children}</div>
    </main>
  )
}

export function LandingPageLoading() {
  return (
    <StatusScreen>
      <Kernel className="size-16 animate-bounce" />
      <p role="status" className="font-display text-2xl">
        Popping the page…
      </p>
    </StatusScreen>
  )
}

type ErrorProps = {
  onRetry: () => void
  isRetrying: boolean
}

export function LandingPageError({ onRetry, isRetrying }: ErrorProps) {
  return (
    <StatusScreen>
      <Kernel className="size-16" />
      <p role="alert" className="font-display text-2xl">
        The page didn't load.
      </p>
      <button type="button" onClick={onRetry} disabled={isRetrying} className={buttonClasses('primary')}>
        {isRetrying ? 'Trying again…' : 'Try again'}
      </button>
    </StatusScreen>
  )
}
