import { type ReactNode, useState } from 'react'

import { readRememberedSiteTheme, useApplySiteTheme } from '@/entities/site'
import { buttonClasses, Kernel } from '@/shared/ui'

// Wears the site's last-seen theme while the real one loads. A first-time visitor gets the
// neutral page color, so a default palette never flashes before the site's own.
function StatusScreen({ children }: { children: ReactNode }) {
  const [rememberedTheme] = useState(readRememberedSiteTheme)
  useApplySiteTheme(rememberedTheme)
  const background = rememberedTheme ? 'bg-butter' : 'bg-kernel'

  return (
    <main className={`grid min-h-screen place-items-center px-5 text-center text-ink ${background}`}>
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
