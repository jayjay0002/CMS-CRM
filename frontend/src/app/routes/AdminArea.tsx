import { AdminLayout } from '@/widgets/admin-layout'

import { RequireAdmin } from './RequireAdmin'

// Everything under /admin (except sign-in screens) sits behind the admin guard.
export function AdminArea() {
  return (
    <RequireAdmin>
      <AdminLayout />
    </RequireAdmin>
  )
}
