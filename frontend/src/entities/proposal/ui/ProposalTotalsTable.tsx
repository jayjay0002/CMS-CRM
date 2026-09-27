import { formatCents, type ProposalTotalsInCents } from '../lib/money'

type Props = {
  totals: ProposalTotalsInCents
  // Customer-facing wording ("Deposit due now") vs the admin's ("Deposit").
  audience?: 'admin' | 'customer'
}

function Row({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${emphasis ? 'text-lg font-bold' : ''}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}

export function ProposalTotalsTable({ totals, audience = 'admin' }: Props) {
  const isCustomer = audience === 'customer'
  return (
    <dl className="space-y-2">
      <Row label="Subtotal" value={formatCents(totals.subtotal)} />
      {totals.discount > 0 && <Row label="Discount" value={`−${formatCents(totals.discount)}`} />}
      <div className="border-t-2 border-ink/20 pt-2">
        <Row label="Total" value={formatCents(totals.total)} emphasis />
      </div>
      <Row label={isCustomer ? 'Deposit due now' : 'Deposit'} value={formatCents(totals.deposit)} />
      <Row label={isCustomer ? 'Balance due at the event' : 'Balance due'} value={formatCents(totals.balance)} />
    </dl>
  )
}
