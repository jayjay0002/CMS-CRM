export const ROUTES = {
  home: '/',
  // Landing page as the website builder previews it (unlinked; shows drafts from the builder).
  sitePreview: '/preview',
  admin: '/admin',
  adminWebsite: '/admin/website',
  adminUsers: '/admin/users',
  adminLogin: '/admin/login',
  adminResetPassword: '/admin/reset-password',
} as const

// Where to send someone after they sign in (set when the admin guard redirects them).
export type LoginRedirectState = { from?: string } | null
