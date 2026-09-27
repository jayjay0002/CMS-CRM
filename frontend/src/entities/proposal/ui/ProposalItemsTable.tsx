import { formatCents, formatUsd, lineTotalCents } from '../lib/money'
import type { ProposalItem } from '../model/types'

type Props = {
  items: readonly ProposalItem[]
  caption: string
}

// Read-only itemized quote. On phones, qty × price folds under the description so nothing scrolls sideways.
export function ProposalItemsTable({ items, caption }: Props) {
  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b-2 border-ink text-sm">
          <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
          <th scope="col" className="hidden px-3 py-2 text-right font-semibold sm:table-cell">Qty</th>
          <th scope="col" className="hidden px-3 py-2 text-right font-semibold sm:table-cell">Price</th>
          <th scope="col" className="py-2 pl-3 text-right font-semibold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          // Items have no ids; in this read-only list their position is their identity.
          <tr key={index} className="border-b border-ink/15 align-top">
            <td className="py-3 pr-3">
              {item.description}
              <span className="block text-sm text-ink/70 tabular-nums sm:hidden">
                {item.quantity} × {formatUsd(item.unit_price)}
              </span>
            </td>
            <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">{item.quantity}</td>
            <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">{formatUsd(item.unit_price)}</td>
            <td className="py-3 pl-3 text-right font-semibold tabular-nums">{formatCents(lineTotalCents(item))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
