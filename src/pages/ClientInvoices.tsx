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
}

type UpcomingSchedule = {
  id: string
  name: string
  amount_cents: number
  interval_unit: string
  interval_count: number
  next_run_at: string
  due_date: string
  coverage_start_date: string
  coverage_end_date: string
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
    <div className="panel">
      <h2>Your invoices & receipts</h2>
      {error ? <p className="error">{error}</p> : null}
      {upcoming ? (
        <div className="panel-notice" style={{ marginBottom: '1rem' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Next scheduled invoice</p>
          <p style={{ margin: '0.35rem 0 0' }}>
            <strong>{upcoming.name}</strong> · {formatAudCents(upcoming.amount_cents)}
          </p>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Coverage: {upcoming.coverage_start_date} to {upcoming.coverage_end_date}
            {' · '}Issue date: {new Date(upcoming.next_run_at).toLocaleDateString()}
            {' · '}Due: {upcoming.due_date}
          </p>
          <p style={{ margin: '0.45rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Want to pay this period early? Ask us to issue the next invoice ahead of the run date.
          </p>
        </div>
      ) : null}
      <table className="data client-invoices-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Due</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i.id}>
              <td>{i.invoice_number}</td>
              <td>{i.status}</td>
              <td>{formatAudCents(i.amount_cents)}</td>
              <td>{i.due_date}</td>
              <td>
                <Link to={`/app/client/invoices/${i.id}`} className="link-inline">
                  View / pay
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
