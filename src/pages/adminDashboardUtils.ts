export type Client = {
  id: string
  email: string
  name: string
  hasPortalToken: boolean
  portalTokenExpiresAt: string | null
}

export type Invoice = {
  id: string
  client_id: string
  invoice_number: string
  status: string
  amount_cents: number
  due_date: string
  description: string | null
  line_items?: { description: string; quantity: number; unitPriceCents: number }[]
}

export type Schedule = {
  id: string
  client_id: string
  name: string
  amount_cents: number
  interval_unit: string
  interval_count: number
  next_run_at: string
  active: boolean
  due_days_after_run?: number
  client_name?: string
}

export type Template = { key: string; label: string; description: string }

export type CustomLineRow = { id: string; description: string; quantity: string; unitAud: string }

export function collectLineItemsFromRows(rows: CustomLineRow[]) {
  const lineItems = rows
    .map((row) => ({
      description: row.description.trim(),
      quantity: Math.max(0, Number.parseFloat(row.quantity) || 0),
      unitPriceCents: audToCents(row.unitAud),
    }))
    .filter((r) => r.description && r.quantity > 0 && r.unitPriceCents > 0)
  return lineItems.length ? lineItems : null
}

export function newCustomLine(): CustomLineRow {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? String(Math.random()),
    description: '',
    quantity: '1',
    unitAud: '',
  }
}

export function audToCents(aud: string): number {
  const n = Number.parseFloat(aud.replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100)
}

export function defaultDueDate() {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().slice(0, 10)
}

export function defaultScheduleRun() {
  const nr = new Date()
  nr.setMinutes(nr.getMinutes() + 5)
  return nr.toISOString().slice(0, 16)
}
