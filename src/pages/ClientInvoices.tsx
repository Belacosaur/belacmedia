import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../api'

type Invoice = {
  id: string
  invoice_number: string
  status: string
  amount_cents: number
  due_date: string
}

export default function ClientInvoices() {
  const [rows, setRows] = useState<Invoice[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    apiJson<{ invoices: Invoice[] }>('/api/client/invoices')
      .then((r) => setRows(r.invoices))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
  }, [])

  return (
    <div className="panel">
      <h2>Your invoices & receipts</h2>
      {error ? <p className="error">{error}</p> : null}
      <table className="data">
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
              <td>{(i.amount_cents / 100).toFixed(2)} AUD</td>
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
