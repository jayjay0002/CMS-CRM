import type { ProposalItem, ProposalTotals } from '../model/types'

// Money math in whole cents so 0.1 + 0.2 never shows up on a quote.
// Display only: the server recalculates and is authoritative.

const CENTS_PER_DOLLAR = 100
const DECIMAL_PLACES = 2

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: DECIMAL_PLACES,
  maximumFractionDigits: DECIMAL_PLACES,
})

// "450.00" | "450" | 450 -> 45000. Blank or invalid input counts as 0.
export function toCents(amount: string | number): number {
  const value = typeof amount === 'number' ? amount : Number.parseFloat(amount)
  return Number.isFinite(value) ? Math.round(value * CENTS_PER_DOLLAR) : 0
}

// 45000 -> "450.00", the format the API expects.
export function centsToDecimal(cents: number): string {
  return (cents / CENTS_PER_DOLLAR).toFixed(DECIMAL_PLACES)
}

// Normalizes whatever was typed ("12.5", "12") to the API's "12.50".
export function toDecimalString(amount: string | number): string {
  return centsToDecimal(toCents(amount))
}

export function formatUsd(amount: string | number): string {
  return usdFormatter.format(toCents(amount) / CENTS_PER_DOLLAR)
}

export function formatCents(cents: number): string {
  return usdFormatter.format(cents / CENTS_PER_DOLLAR)
}

export type ProposalTotalsInCents = {
  subtotal: number
  discount: number
  total: number
  deposit: number
  balance: number
}

type ItemLike = Pick<ProposalItem, 'quantity'> & { unit_price: string | number }

export function lineTotalCents(item: ItemLike): number {
  const quantity = Number.isFinite(item.quantity) ? item.quantity : 0
  return quantity * toCents(item.unit_price)
}

// subtotal = Σ qty × price; total = max(subtotal − discount, 0); balance = total − deposit.
export function computeTotals(
  items: readonly ItemLike[],
  discount: string | number,
  deposit: string | number,
): ProposalTotalsInCents {
  const subtotal = items.reduce((sum, item) => sum + lineTotalCents(item), 0)
  const discountCents = toCents(discount)
  const total = Math.max(subtotal - discountCents, 0)
  const depositCents = toCents(deposit)
  return {
    subtotal,
    discount: discountCents,
    total,
    deposit: depositCents,
    balance: total - depositCents,
  }
}

// The server's totals (decimal strings) in cents, for the totals table.
export function totalsFromServer(totals: ProposalTotals): ProposalTotalsInCents {
  return {
    subtotal: toCents(totals.subtotal),
    discount: toCents(totals.discount),
    total: toCents(totals.total),
    deposit: toCents(totals.deposit),
    balance: toCents(totals.balance),
  }
}
