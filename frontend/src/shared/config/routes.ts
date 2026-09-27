export const ROUTES = {
  home: '/',
  admin: '/admin',
  adminLogin: '/admin/login',
  adminResetPassword: '/admin/reset-password',
} as const

// Where to send someone after they sign in (set when the admin guard redirects them).
export type LoginRedirectState = { from?: string } | null
