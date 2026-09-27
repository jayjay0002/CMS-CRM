import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'

import { HomePage } from '@/pages/home'
import { ROUTES } from '@/shared/config'

// Admin screens (and supabase-js with them) load only when someone opens /admin.
const AdminArea = lazy(() => import('./routes/AdminArea').then((m) => ({ default: m.AdminArea })))
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin-dashboard').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminWebsitePage = lazy(() =>
  import('@/pages/admin-website').then((m) => ({ default: m.AdminWebsitePage })),
)
const AdminUsersPage = lazy(() => import('@/pages/admin-users').then((m) => ({ default: m.AdminUsersPage })))
const AdminBookingPage = lazy(() => import('@/pages/admin-booking').then((m) => ({ default: m.AdminBookingPage })))
// Landing page for the website builder's preview iframe (never linked publicly).
const SitePreviewPage = lazy(() => import('@/pages/site-preview').then((m) => ({ default: m.SitePreviewPage })))
const AdminLoginPage = lazy(() => import('@/pages/admin-login').then((m) => ({ default: m.AdminLoginPage })))
const AdminResetPasswordPage = lazy(() =>
  import('@/pages/admin-reset-password').then((m) => ({ default: m.AdminResetPasswordPage })),
)

function RouteFallback() {
  return (
    <div role="status" className="grid min-h-screen place-items-center bg-kernel text-lg">
      Loading…
    </div>
  )
}

export function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.sitePreview} element={<SitePreviewPage />} />
        <Route path={ROUTES.adminLogin} element={<AdminLoginPage />} />
        <Route path={ROUTES.adminResetPassword} element={<AdminResetPasswordPage />} />
        <Route path={ROUTES.admin} element={<AdminArea />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path={ROUTES.adminWebsite} element={<AdminWebsitePage />} />
          <Route path={ROUTES.adminUsers} element={<AdminUsersPage />} />
          <Route path={ROUTES.adminBooking} element={<AdminBookingPage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </Suspense>
  )
}
