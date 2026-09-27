export const ROUTES = {
  home: '/',
  // Landing page as the website builder previews it (unlinked; shows drafts from the builder).
  sitePreview: '/preview',
  admin: '/admin',
  adminWebsite: '/admin/website',
  adminUsers: '/admin/users',
  // One booking's detail page; build links with adminBookingPath(id).
  adminBooking: '/admin/bookings/:bookingId',
  // Every proposal across bookings.
  adminProposals: '/admin/proposals',
  // The proposal editor; build links with adminProposalPath(id).
  adminProposal: '/admin/proposals/:proposalId',
  // The customer's proposal page, reached through the secret link in their email.
  proposal: '/proposal/:token',
  adminLogin: '/admin/login',
  adminResetPassword: '/admin/reset-password',
} as const

// Where to send someone after they sign in (set when the admin guard redirects them).
export type LoginRedirectState = { from?: string } | null

export function adminBookingPath(bookingId: number): string {
  return ROUTES.adminBooking.replace(':bookingId', String(bookingId))
}

export function adminProposalPath(proposalId: number): string {
  return ROUTES.adminProposal.replace(':proposalId', String(proposalId))
}
