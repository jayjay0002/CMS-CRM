import { Link, matchPath, NavLink, Outlet, useLocation } from 'react-router'

import { ADMIN_ROLES, useCurrentAdmin } from '@/entities/admin'
import { useBookingSummary } from '@/entities/booking'
import { useSite } from '@/entities/site'
import { useLogout } from '@/features/auth-logout'
import { ROUTES } from '@/shared/config'
import { Kernel } from '@/shared/ui'

const ADMIN_NAV = [
  // Booking detail pages count as part of Bookings; the badge shows how many wait for a reply.
  { label: 'Bookings', to: ROUTES.admin, end: true, alsoActiveOn: ROUTES.adminBooking, showsPendingCount: true },
  { label: 'Website', to: ROUTES.adminWebsite, end: false },
  // Only owners manage admins (the API enforces this too).
  { label: 'Admins', to: ROUTES.adminUsers, end: false, ownerOnly: true },
] as const

// Screens that fill the whole window below the header and scroll inside their own panels.
const FULL_BLEED_ROUTES: readonly string[] = [ROUTES.adminWebsite]

function navLinkClasses({ isActive }: { isActive: boolean }): string {
  const base = 'inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-semibold transition-colors'
  return isActive ? `${base} bg-butter text-ink` : `${base} text-kernel/85 hover:bg-kernel/10 hover:text-kernel`
}

export function AdminLayout() {
  const { data: admin } = useCurrentAdmin()
  const pendingCount = useBookingSummary().data?.pending_count ?? 0
  const businessName = useSite().data?.settings.businessName
  const logout = useLogout()
  const { pathname } = useLocation()
  const isFullBleed = FULL_BLEED_ROUTES.some((route) => matchPath(route, pathname))

  return (
    <div className={isFullBleed ? 'relative flex h-dvh flex-col overflow-hidden bg-kernel' : 'min-h-screen bg-kernel'}>
      <header className="shrink-0 border-b-4 border-butter bg-ink text-kernel [&_*:focus-visible]:outline-butter">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link to={ROUTES.admin} className="flex items-center gap-2">
            <Kernel className="size-8 shrink-0" />
            {businessName && (
              <span className="font-display text-lg text-balance text-butter sm:text-xl sm:whitespace-nowrap">
                {businessName}
              </span>
            )}
            <span className="rounded-full bg-butter px-2.5 py-0.5 text-sm font-bold text-ink">Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            {admin && (
              <p className="text-sm text-kernel/80">
                Signed in as <span className="font-semibold text-kernel">{admin.full_name}</span>
              </p>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-full border-2 border-kernel/60 px-4 py-1.5 text-sm font-semibold hover:border-butter hover:text-butter"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav aria-label="Admin" className="mx-auto max-w-6xl px-5 pb-3 md:px-8">
          <ul className="flex flex-wrap gap-2">
            {ADMIN_NAV.filter((item) => !('ownerOnly' in item) || admin?.role === ADMIN_ROLES.owner).map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    navLinkClasses({
                      isActive: isActive || ('alsoActiveOn' in item && matchPath(item.alsoActiveOn, pathname) !== null),
                    })
                  }
                >
                  {item.label}
                  {'showsPendingCount' in item && pendingCount > 0 && (
                    <span className="rounded-full bg-cherry px-2 text-sm font-bold text-kernel">
                      {pendingCount}
                      <span className="sr-only"> pending</span>
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className={isFullBleed ? 'flex min-h-0 flex-1' : 'mx-auto max-w-6xl px-5 py-10 md:px-8'}>
        <Outlet />
      </main>
    </div>
  )
}
