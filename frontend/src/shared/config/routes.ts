export const ROUTES = {
  home: '/',
  // Landing page as the website builder previews it (unlinked; shows drafts from the builder).
  sitePreview: '/preview',
  admin: '/admin',
  adminWebsite: '/admin/website',
  adminUsers: '/admin/users',
  // One booking's detail page; build links with adminBookingPath(id).
  adminBooking: '/admin/bookings/:bookingId',
  adminLogin: '/admin/login',
  adminResetPassword: '/admin/reset-password',
} as const

// Where to send someone after they sign in (set when the admin guard redirects them).
export type LoginRedirectState = { from?: string } | null

export function adminBookingPath(bookingId: number): string {
  return ROUTES.adminBooking.replace(':bookingId', String(bookingId))
}
