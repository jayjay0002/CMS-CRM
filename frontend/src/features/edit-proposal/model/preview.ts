import {
  type AdminProposal,
  centsToDecimal,
  lineTotalCents,
  type ProposalTotalsInCents,
  toDecimalString,
} from '@/entities/proposal'

import type { ProposalFormValues } from './schema'

// The proposal as it stands in the editor right now (saved or not), for the live customer preview.
export function proposalWithEdits(
  proposal: AdminProposal,
  values: ProposalFormValues,
  totals: ProposalTotalsInCents,
): AdminProposal {
  const message = values.message.trim()
  return {
    ...proposal,
    items: values.items.map((item) => {
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 0
      return {
        description: item.description.trim() || 'New item',
        quantity,
        unit_price: toDecimalString(item.unitPrice),
        line_total: centsToDecimal(lineTotalCents({ quantity, unit_price: item.unitPrice })),
      }
    }),
    valid_until: values.validUntil || proposal.valid_until,
    message: message || null,
    subtotal: centsToDecimal(totals.subtotal),
    discount: centsToDecimal(totals.discount),
    total: centsToDecimal(totals.total),
    deposit: centsToDecimal(totals.deposit),
    balance: centsToDecimal(totals.balance),
  }
}
