import { Link, Outlet } from 'react-router'

import { useCurrentAdmin } from '@/entities/admin'
import { useLogout } from '@/features/auth-logout'
import { BUSINESS, ROUTES } from '@/shared/config'
import { Kernel } from '@/shared/ui'

export function AdminLayout() {
  const { data: admin } = useCurrentAdmin()
  const logout = useLogout()

  return (
    <div className="min-h-screen bg-kernel">
      <header className="border-b-4 border-butter bg-ink text-kernel [&_*:focus-visible]:outline-butter">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link to={ROUTES.admin} className="flex items-center gap-2">
            <Kernel className="size-8 shrink-0" />
            <span className="font-display text-lg text-balance text-butter sm:text-xl sm:whitespace-nowrap">
              {BUSINESS.name}
            </span>
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
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <Outlet />
      </main>
    </div>
  )
}
