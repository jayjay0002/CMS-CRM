import { useQuery } from '@tanstack/react-query'

import { fetchAdminSections, fetchAdminSiteSettings, fetchAdminTheme, fetchSite } from '../api/siteApi'
import { siteKeys } from './queryKeys'

// Public page content: business info, theme, and the visible sections in display order.
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

export function useAdminTheme() {
  return useQuery({
    queryKey: siteKeys.adminTheme(),
    queryFn: fetchAdminTheme,
  })
}

// Every section, hidden ones included, in display order.
export function useAdminSections() {
  return useQuery({
    queryKey: siteKeys.adminSections(),
    queryFn: fetchAdminSections,
  })
}
