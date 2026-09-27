import { useQuery } from '@tanstack/react-query'

import { fetchAdminSections, fetchAdminSiteSettings, fetchSite } from '../api/siteApi'
import { siteKeys } from './queryKeys'

// Public page content: business info plus the visible sections in display order.
export function useSite() {
  return useQuery({
    queryKey: siteKeys.public(),
    queryFn: fetchSite,
  })
}

export function useAdminSiteSettings() {
  return useQuery({
    queryKey: siteKeys.adminSettings(),
    queryFn: fetchAdminSiteSettings,
  })
}

// Every section, hidden ones included, in display order.
export function useAdminSections() {
  return useQuery({
    queryKey: siteKeys.adminSections(),
    queryFn: fetchAdminSections,
  })
}
