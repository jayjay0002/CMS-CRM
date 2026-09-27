import { z } from 'zod'

import {
  type AdminProposal,
  computeTotals,
  PROPOSAL_LIMITS,
  type ProposalDraftInput,
  toDecimalString,
} from '@/entities/proposal'
import { todayInBusinessTimezone } from '@/shared/lib'

// Dollars with up to two decimals: "450", "12.5", "12.50".
const MONEY_PATTERN = /^\d{1,9}(\.\d{1,2})?$/
const MONEY_MESSAGE = 'Enter an amount like 450 or 12.50'
export const DEPOSIT_TOO_HIGH = 'The deposit can’t be more than the total'

const money = z.string().trim().regex(MONEY_PATTERN, MONEY_MESSAGE)

const itemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Describe this item')
    .max(PROPOSAL_LIMITS.descriptionMaxLength, `Keep it under ${PROPOSAL_LIMITS.descriptionMaxLength} characters`),
  quantity: z
    .number({ error: 'Enter a quantity' })
    .int('Use a whole number')
    .min(PROPOSAL_LIMITS.minQuantity, `At least ${PROPOSAL_LIMITS.minQuantity}`)
    .max(PROPOSAL_LIMITS.maxQuantity, `At most ${PROPOSAL_LIMITS.maxQuantity}`),
  unitPrice: money,
})

export const proposalFormSchema = z
  .object({
    items: z
      .array(itemSchema)
      .min(1, 'Add at least one item')
      .max(PROPOSAL_LIMITS.maxItems, `Up to ${PROPOSAL_LIMITS.maxItems} items`),
    discount: money,
    deposit: money,
    validUntil: z
      .string()
      .min(1, 'Pick a date')
      .refine((date) => date >= todayInBusinessTimezone(), 'Pick today or a later date'),
    message: z
      .string()
      .max(PROPOSAL_LIMITS.messageMaxLength, `Keep it under ${PROPOSAL_LIMITS.messageMaxLength} characters`),
  })
  .superRefine((values, context) => {
    const totals = computeTotals(
      values.items.map((item) => ({ quantity: item.quantity, unit_price: item.unitPrice })),
      values.discount,
      values.deposit,
    )
    if (totals.deposit > totals.total) {
      context.addIssue({ code: 'custom', path: ['deposit'], message: DEPOSIT_TOO_HIGH })
    }
  })

export type ProposalFormValues = z.infer<typeof proposalFormSchema>
export type ProposalItemValues = ProposalFormValues['items'][number]

export const NEW_ITEM: ProposalItemValues = { description: '', quantity: 1, unitPrice: '0.00' }

export function toFormValues(proposal: AdminProposal): ProposalFormValues {
  return {
    items: proposal.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    })),
    discount: proposal.discount,
    deposit: proposal.deposit,
    validUntil: proposal.valid_until,
    message: proposal.message ?? '',
  }
}

export function toDraftInput(values: ProposalFormValues): ProposalDraftInput {
  const message = values.message.trim()
  return {
    items: values.items.map((item) => ({
      description: item.description.trim(),
      quantity: item.quantity,
      unit_price: toDecimalString(item.unitPrice),
    })),
    discount: toDecimalString(values.discount),
    deposit: toDecimalString(values.deposit),
    valid_until: values.validUntil,
    message: message || null,
  }
}
