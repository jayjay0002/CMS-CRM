import { useSite } from '@/entities/site'
import { LandingPage, LandingPageError, LandingPageLoading } from '@/widgets/landing-page'

export function HomePage() {
  const { data: site, isPending, isError, refetch, isRefetching } = useSite()

  if (isPending) return <LandingPageLoading />
  if (isError) return <LandingPageError onRetry={() => refetch()} isRetrying={isRefetching} />
  return <LandingPage site={site} />
}
