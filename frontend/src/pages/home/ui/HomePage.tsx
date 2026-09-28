import { useEffect } from 'react'

import { rememberSiteTheme, useSite } from '@/entities/site'
import { LandingPage, LandingPageError, LandingPageLoading } from '@/widgets/landing-page'

export function HomePage() {
  const { data: site, isPending, isError, refetch, isRefetching } = useSite()
  const theme = site?.theme

  // Only the published page is remembered; builder drafts must not leak into the loader.
  useEffect(() => {
    if (theme) rememberSiteTheme(theme)
  }, [theme])

  if (isPending) return <LandingPageLoading />
  if (isError) return <LandingPageError onRetry={() => refetch()} isRetrying={isRefetching} />
  return <LandingPage site={site} />
}
