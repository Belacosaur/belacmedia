import { formatAudCents, lineAmountCents } from '../formatMoney'

export type Client = {
  id: string
  email: string
  name: string
  hasPortalToken: boolean
  portalTokenExpiresAt: string | null
}

export type ParsedLineItem = {
  description: string
  quantity: number
  unitPriceCents: number
}

export type Invoice = {
  id: string
  client_id: string
  invoice_number: string
  status: string
  amount_cents: number
  /** Gross collected amount when paid (e.g. card incl. fees). */
  amount_paid_cents?: number | null
  due_date: string
  description: string | null
  period_start?: string | null
  period_end?: string | null
  line_items?: { description: string; quantity: number; unitPriceCents: number }[]
  created_at?: string
  subtotal_cents?: number | null
  tax_cents?: number | null
  client_name?: string
  client_email?: string
  source_schedule_id?: string | null
  source_schedule_name?: string | null
  source_schedule_interval_unit?: string | null
  source_schedule_interval_count?: number | null
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
  occurrence_limit?: number | null
  runs_completed?: number
}

export type Template = {
  key: string
  label: string
  description: string
  lineItems?: { description: string; quantity: number; unitPriceCents: number }[]
  subtotalCents?: number
  taxCents?: number
  totalCents?: number
}

/** Preset schedule cadences — avoids confusing “repeat every 12” with “12 monthly invoices”. */
export type ScheduleCadencePresetId =
  | 'monthly_1'
  | 'once'
  | 'weekly'
  | 'biweekly'
  | 'monthly_2'
  | 'monthly_3'
  | 'quarterly'
  | 'yearly'
  | 'custom'

export const SCHEDULE_CADENCE_OPTIONS: { id: ScheduleCadencePresetId; label: string }[] = [
  { id: 'monthly_1', label: 'Every month (12 separate invoices per year)' },
  { id: 'once', label: 'One time only' },
  { id: 'weekly', label: 'Every week' },
  { id: 'biweekly', label: 'Every two weeks' },
  {
    id: 'monthly_2',
    label: 'Every 2 months — one invoice covering ~2 months each time',
  },
  {
    id: 'monthly_3',
    label: 'Every 3 months — one invoice covering ~3 months each time',
  },
  { id: 'quarterly', label: 'Every quarter (same as every 3 months)' },
  { id: 'yearly', label: 'Every year' },
  { id: 'custom', label: 'Advanced: set interval + step manually (easy to get wrong)' },
]

export function cadencePresetToInterval(
  preset: ScheduleCadencePresetId,
): { intervalUnit: string; intervalCount: number } {
  switch (preset) {
    case 'once':
      return { intervalUnit: 'once', intervalCount: 1 }
    case 'weekly':
      return { intervalUnit: 'weekly', intervalCount: 1 }
    case 'biweekly':
      return { intervalUnit: 'biweekly', intervalCount: 1 }
    case 'monthly_1':
      return { intervalUnit: 'monthly', intervalCount: 1 }
    case 'monthly_2':
      return { intervalUnit: 'monthly', intervalCount: 2 }
    case 'monthly_3':
      return { intervalUnit: 'monthly', intervalCount: 3 }
    case 'quarterly':
      return { intervalUnit: 'quarterly', intervalCount: 1 }
    case 'yearly':
      return { intervalUnit: 'yearly', intervalCount: 1 }
    case 'custom':
      return { intervalUnit: 'monthly', intervalCount: 1 }
  }
}

/** Plain-language warning for what lands on each PDF / coverage footer. */
export function scheduleCadenceCoverageExplanation(
  intervalUnit: string,
  intervalCount: number,
): string {
  const n = Math.max(1, Math.floor(Number(intervalCount)) || 1)
  switch (intervalUnit) {
    case 'monthly':
      if (n === 1) {
        return 'Each run creates one invoice for roughly one month’s billing — same idea as Railway-style monthly rows.'
      }
      return `Each run creates ONE invoice whose coverage spans about ${n} months (not ${n} monthly invoices). For ${n} separate monthly invoices, choose “Every month” and set “Stop after” to ${n}.`
    case 'weekly':
      return n === 1
        ? 'Each invoice covers about one week until the next run.'
        : `Each invoice covers about ${n} weeks on one bill.`
    case 'biweekly':
      return n === 1
        ? 'Each invoice covers about two weeks until the next run.'
        : `Each invoice covers about ${n}×2 weeks on one bill.`
    case 'quarterly':
      return 'Each invoice covers about three months on one bill.'
    case 'yearly':
      return n === 1
        ? 'Each invoice covers about one year on one bill.'
        : `Each invoice covers about ${n} years on one bill.`
    case 'once':
      return 'Runs once then stops.'
    default:
      return ''
  }
}

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

export function parseInvoiceLineItems(raw: unknown): ParsedLineItem[] {
  if (raw == null) return []
  let arr: unknown = raw
  if (typeof raw === 'string') {
    try {
      arr = JSON.parse(raw)
    } catch {
      return []
    }
  }
  if (!Array.isArray(arr)) return []
  return arr.filter(
    (r): r is ParsedLineItem =>
      r != null &&
      typeof r === 'object' &&
      typeof (r as ParsedLineItem).description === 'string' &&
      typeof (r as ParsedLineItem).quantity === 'number' &&
      typeof (r as ParsedLineItem).unitPriceCents === 'number',
  )
}

/** Returns the human-readable coverage segment appended by scheduled billing, if present. */
export function extractCoveragePeriod(description: string | null): string | null {
  if (!description?.trim()) return null
  const m = description.match(/Coverage period:\s*([^\n]+)/i)
  return m ? m[1].trim() : null
}

/** Invoice note / description with the auto coverage footer stripped. */
export function invoiceNoteExcludingCoverage(description: string | null): string | null {
  if (!description?.trim()) return null
  const stripped = description
    .replace(/\s*Coverage period:[^\n]*/gi, '')
    .replace(/\n+/g, '\n')
    .trim()
  return stripped || null
}

/** Short label for schedule repeat settings (admin context). */
export function scheduleCadenceShort(
  intervalUnit: string | null | undefined,
  intervalCount: number | null | undefined,
): string {
  const n = Math.max(1, Math.floor(Number(intervalCount)) || 1)
  switch (intervalUnit) {
    case 'once':
      return 'One-off run'
    case 'weekly':
      return n === 1 ? 'Weekly' : `Every ${n} wks`
    case 'biweekly':
      return n === 1 ? 'Biweekly' : `Biweekly ×${n}`
    case 'monthly':
      return n === 1 ? 'Monthly' : `Every ${n} mo`
    case 'quarterly':
      return n === 1 ? 'Quarterly' : `Every ${n} qtr`
    case 'yearly':
      return n === 1 ? 'Yearly' : `Every ${n} yr`
    default:
      return ''
  }
}

export function formatAdminLineBreakdown(lines: ParsedLineItem[]): string[] {
  return lines.map((row) => {
    const lineTotal = lineAmountCents(row.quantity, row.unitPriceCents)
    const d =
      row.description.length > 44 ? `${row.description.slice(0, 41)}…` : row.description
    return `${d} ×${row.quantity} @ ${formatAudCents(row.unitPriceCents)} → ${formatAudCents(lineTotal)}`
  })
}

export function hasNonUnitQuantities(lines: ParsedLineItem[]): boolean {
  return lines.some((r) => Number.isFinite(r.quantity) && r.quantity !== 1)
}

export function formatAdminIssuedDate(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatAdminDueDate(due: string): string {
  const d = new Date(due)
  if (Number.isNaN(d.getTime())) return due
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}
