import type { ReactNode } from 'react'

import {
  ADMIN_ROLE_LABELS,
  ADMIN_ROLES,
  ADMIN_STATUS_BADGE_CLASSES,
  ADMIN_STATUS_LABELS,
  type AdminListItem,
  formatLastSignIn,
  useAdminUsers,
  useCurrentAdmin,
} from '@/entities/admin'
import { InviteAdminForm } from '@/features/invite-admin'
import { AdminRowActions } from '@/features/manage-admin'
import { buttonClasses } from '@/shared/ui'

function Card({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border-4 border-ink bg-white p-6 shadow-sign md:p-8">
      <h2 className="font-display text-2xl text-ink md:text-3xl">{title}</h2>
      {intro && <p className="mt-1 text-ink/75">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function AdminRow({ admin, isSelf }: { admin: AdminListItem; isSelf: boolean }) {
  return (
    <li className="grid gap-4 rounded-2xl border-2 border-ink/15 bg-kernel p-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.6fr)] md:items-start">
      <div className="min-w-0">
        <p className="font-bold">
          {admin.full_name}
          {isSelf && <span className="ml-2 text-sm font-semibold text-ink/60">(you)</span>}
        </p>
        <p className="truncate text-sm text-ink/75">{admin.email}</p>
      </div>
      <div className="space-y-1.5 text-sm">
        <p className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ink px-2.5 py-0.5 font-semibold text-kernel">
            {ADMIN_ROLE_LABELS[admin.role]}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 font-semibold ${ADMIN_STATUS_BADGE_CLASSES[admin.status]}`}>
            {ADMIN_STATUS_LABELS[admin.status]}
          </span>
        </p>
        <p className="text-ink/70">Last sign-in: {formatLastSignIn(admin.last_sign_in_at)}</p>
      </div>
      <AdminRowActions admin={admin} isSelf={isSelf} />
    </li>
  )
}

function AdminsList({ currentAdminId }: { currentAdminId: number }) {
  const adminsQuery = useAdminUsers()

  if (adminsQuery.isPending) {
    return <p role="status" className="text-ink/75">Loading admins…</p>
  }
  if (adminsQuery.isError) {
    return (
      <div role="alert" className="space-y-3">
        <p className="text-ink/80">We couldn’t load the admin list.</p>
        <button type="button" onClick={() => adminsQuery.refetch()} className={buttonClasses('secondary')}>
          Try again
        </button>
      </div>
    )
  }
  if (adminsQuery.data.length === 0) {
    return <p className="text-ink/75">No admins yet. Invite someone above.</p>
  }
  return (
    <ul className="space-y-3">
      {adminsQuery.data.map((admin) => (
        <AdminRow key={admin.id} admin={admin} isSelf={admin.id === currentAdminId} />
      ))}
    </ul>
  )
}

export function AdminUsersPage() {
  const { data: currentAdmin } = useCurrentAdmin()

  if (!currentAdmin) return null
  if (currentAdmin.role !== ADMIN_ROLES.owner) {
    return (
      <section>
        <h1 className="font-display text-4xl text-ink md:text-5xl">Admins</h1>
        <p className="mt-6 rounded-2xl border-2 border-dashed border-ink/40 p-8 text-lg text-ink/80">
          Only owners can manage admins.
        </p>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl text-ink md:text-5xl">Admins</h1>
        <p className="mt-3 max-w-2xl text-ink/80">
          Invite the people who help run the site. <strong>Owners</strong> can do everything,
          including managing admins. <strong>Staff</strong> handle bookings, packages and the website.
        </p>
      </header>
      <Card title="Invite an admin" intro="You’ll get a link to send them. They choose their own password.">
        <InviteAdminForm />
      </Card>
      <Card title="People with access">
        <AdminsList currentAdminId={currentAdmin.id} />
      </Card>
    </div>
  )
}
