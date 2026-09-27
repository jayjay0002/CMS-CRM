const CURRENCY = 'USD'
const LOCALE = 'en-US'

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

export function formatPrice(amount: number): string {
  return priceFormatter.format(amount)
}
