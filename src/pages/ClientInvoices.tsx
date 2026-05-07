import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../api'
import { formatAudCents } from '../formatMoney'

type Invoice = {
  id: string
  invoice_number: string
  status: string
  amount_cents: number
  due_date: string
  created_at: string
  description: string | null
}

type UpcomingSchedule = {
  id: string
  name: string
  next_run_at: string
  due_date: string
}

function formatHistoryDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function invoiceRowDescription(inv: Invoice): string {
  const raw = inv.description?.trim()
  if (raw) {
    const first = raw.split('\n')[0].trim()
    if (first.length > 100) return `${first.slice(0, 97)}…`
    return first
  }
  return `Invoice ${inv.invoice_number}`
}

function StatusIcon({ status }: { status: 'paid' | 'issued' | 'awaiting_proof' | 'void' | 'scheduled' }) {
  if (status === 'paid') {
    return (
      <span className="billing-history-status billing-history-status--paid" title="Paid" aria-label="Paid">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="8" fill="currentColor" />
          <path
            d="M4.75 8.15 7.1 10.5 11.25 5.6"
            stroke="white"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }
  if (status === 'void') {
    return (
      <span className="billing-history-status billing-history-status--void" title="Void" aria-label="Void">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.25" fill="none" />
          <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </span>
    )
  }
  if (status === 'scheduled') {
    return (
      <span
        className="billing-history-status billing-history-status--scheduled"
        title="Scheduled"
        aria-label="Scheduled — not yet issued"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.25" fill="none" strokeDasharray="3 2" />
        </svg>
      </span>
    )
  }
  return (
    <span className="billing-history-status billing-history-status--open" title="Open" aria-label="Open — unpaid">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.25" fill="none" />
      </svg>
    </span>
  )
}

function rowStatus(inv: Invoice): 'paid' | 'issued' | 'awaiting_proof' | 'void' {
  if (inv.status === 'paid' || inv.status === 'void' || inv.status === 'awaiting_proof' || inv.status === 'issued') {
    return inv.status
  }
  return 'issued'
}

export default function ClientInvoices() {
  const [rows, setRows] = useState<Invoice[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingSchedule | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiJson<{ invoices: Invoice[]; upcomingSchedule?: UpcomingSchedule | null }>('/api/client/invoices')
      .then((r) => {
        setRows(r.invoices)
        setUpcoming(r.upcomingSchedule || null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
  }, [])

  return (
    <div className="panel billing-history-panel">
      <h2>Billing history</h2>
      <p className="billing-history-lead">
        One row per invoice. When your plan runs each period, a new invoice appears here with that period’s
        amount.
      </p>
      {error ? <p className="error">{error}</p> : null}

      {!rows.length && !upcoming ? (
        <p className="billing-history-empty">No invoices yet.</p>
      ) : (
        <ul className="billing-history-list" role="list">
          {upcoming ? (
            <li
              className="billing-history-row billing-history-row--scheduled"
              key={`scheduled-${upcoming.id}`}
            >
              <StatusIcon status="scheduled" />
              <time className="billing-history-date" dateTime={upcoming.next_run_at}>
                {formatHistoryDate(upcoming.next_run_at)}
              </time>
              <div className="billing-history-desc-wrap">
                <span className="billing-history-desc">{upcoming.name}</span>
                <span className="billing-history-subline">Next run · due {upcoming.due_date}</span>
              </div>
              <span className="billing-history-amount billing-history-amount--dash" aria-label="Not yet issued">
                —
              </span>
              <span className="billing-history-action billing-history-action--muted" />
            </li>
          ) : null}
          {rows.map((i) => (
            <li className="billing-history-row" key={i.id}>
              <StatusIcon status={rowStatus(i)} />
              <time className="billing-history-date" dateTime={i.created_at}>
                {formatHistoryDate(i.created_at)}
              </time>
              <div className="billing-history-desc-wrap">
                <span className="billing-history-desc">{invoiceRowDescription(i)}</span>
                <span className="billing-history-subline">
                  {i.invoice_number}
                  {i.status !== 'paid' ? ` · due ${i.due_date}` : null}
                </span>
              </div>
              <span className="billing-history-amount">{formatAudCents(i.amount_cents)}</span>
              <Link to={`/app/client/invoices/${i.id}`} className="billing-history-view link-inline">
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
