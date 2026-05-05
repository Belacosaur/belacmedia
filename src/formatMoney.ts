export function formatAudCents(cents: number, currency = 'AUD') {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(cents / 100)
}

/** Line amount from quantity × unit (cents), matching server rounding. */
export function lineAmountCents(quantity: number, unitPriceCents: number) {
  const q = Number(quantity)
  const u = Math.round(unitPriceCents)
  if (!Number.isFinite(q) || u <= 0) return 0
  return Math.round(q * u)
}
