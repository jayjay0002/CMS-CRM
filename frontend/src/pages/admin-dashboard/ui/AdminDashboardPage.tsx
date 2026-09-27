import { useCurrentAdmin } from '@/entities/admin'

export function AdminDashboardPage() {
  const { data: admin } = useCurrentAdmin()
  const firstName = admin?.full_name.split(' ')[0] ?? ''

  return (
    <section>
      <h1 className="font-display text-4xl text-ink md:text-5xl">Welcome, {firstName}</h1>
      <div className="mt-8 rounded-2xl border-2 border-dashed border-ink/40 p-8 text-lg text-ink/80">
        Booking requests will be listed here in the next update.
      </div>
    </section>
  )
}
