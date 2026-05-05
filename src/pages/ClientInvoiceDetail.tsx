import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { apiBlob, apiJson } from '../api'
import { formatAudCents, lineAmountCents } from '../formatMoney'

type LineItem = { description: string; quantity: number; unitPriceCents: number }

type Invoice = {
  id: string
  invoice_number: string
  status: string
  amount_cents: number
  /** Set when paid; may exceed amount_cents if paid by card (incl. processing). */
  amount_paid_cents?: number | null
  stripe_checkout_amount_cents?: number
  due_date: string
  description: string | null
  line_items?: LineItem[] | unknown
}

type PayDetails = {
  pay_id?: string | null
  bank_account_name?: string | null
  bsb?: string | null
  account_number?: string | null
}

type InvoiceEvent = {
  event_type: string
  created_at: string
  note?: string | null
}

/** Australian BSB display: 774001 → 774-001 */
function formatBsb(bsb: string): string {
  const d = bsb.replace(/\D/g, '')
  if (d.length === 6) return `${d.slice(0, 3)}-${d.slice(3)}`
  return bsb.trim()
}

export default function ClientInvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const [params, setParams] = useSearchParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [pay, setPay] = useState<PayDetails>({})
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [timeline, setTimeline] = useState<InvoiceEvent[]>([])

  const load = useCallback(async () => {
    if (!id) return
    setError('')
    try {
      const r = await apiJson<{ invoice: Invoice; paymentDetails: PayDetails; timeline?: InvoiceEvent[] }>(
        `/api/client/invoices/${id}`,
      )
      setInvoice(r.invoice)
      setPay(r.paymentDetails)
      setTimeline(Array.isArray(r.timeline) ? r.timeline : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Not found')
    }
  }, [id])

  useEffect(() => {
    void Promise.resolve().then(() => load())
  }, [load])

  const paidFlag = params.get('paid')
  const sessionId = params.get('session_id')

  useEffect(() => {
    if (!id || paidFlag !== '1' || !sessionId) return
    void Promise.resolve()
      .then(async () => {
        setBusy(true)
        try {
          await apiJson(`/api/client/invoices/${id}/confirm-stripe-session`, {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
          })
          setParams({}, { replace: true })
          await load()
        } catch {
          setError('Could not confirm payment yet — refresh in a moment.')
        } finally {
          setBusy(false)
        }
      })
  }, [id, paidFlag, sessionId, setParams, load])

  async function payStripe() {
    if (!id) return
    setBusy(true)
    try {
      const r = await apiJson<{ url: string }>(`/api/client/invoices/${id}/checkout`, {
        method: 'POST',
      })
      window.location.href = r.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Stripe unavailable')
    } finally {
      setBusy(false)
    }
  }

  async function offlinePaid() {
    if (!id) return
    setBusy(true)
    try {
      await apiJson(`/api/client/invoices/${id}/offline-paid`, {
        method: 'POST',
        body: JSON.stringify({ reference: note }),
      })
      await load()
      setNote('')
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  async function downloadInvoice() {
    if (!id) return
    const blob = await apiBlob(`/api/client/invoices/${id}/pdf`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice?.invoice_number || id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadReceipt() {
    if (!id) return
    const blob = await apiBlob(`/api/client/invoices/${id}/receipt/pdf`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${invoice?.invoice_number || id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const lineItems = useMemo((): LineItem[] => {
    const raw = invoice?.line_items
    if (!invoice || !Array.isArray(raw)) return []
    return raw.filter(
      (r): r is LineItem =>
        r &&
        typeof r === 'object' &&
        typeof (r as LineItem).description === 'string' &&
        typeof (r as LineItem).unitPriceCents === 'number',
    )
  }, [invoice])

  if (!invoice) {
    return (
      <div className="panel">
        {error ? <p className="error">{error}</p> : <p>Loading…</p>}
        <p>
          <Link to="/app/client" className="link-inline">
            Back
          </Link>
        </p>
      </div>
    )
  }

  const canPayOnline =
    invoice.status === 'issued' || invoice.status === 'awaiting_proof'
  const canOffline = invoice.status === 'issued'
  const paid = invoice.status === 'paid'

  const stripeTotal =
    invoice.stripe_checkout_amount_cents ?? invoice.amount_cents
  const cardPremium = stripeTotal > invoice.amount_cents

  return (
    <div className="panel">
      <p>
        <Link to="/app/client" className="link-inline">
          ← All invoices
        </Link>
      </p>
      <h2>{invoice.invoice_number}</h2>
      {error ? <p className="error">{error}</p> : null}
      <p>
        {paid ? (
          <>
            {invoice.amount_paid_cents != null &&
            invoice.amount_paid_cents !== invoice.amount_cents ? (
              <>
                <strong>Invoice total:</strong> {formatAudCents(invoice.amount_cents)} ·{' '}
                <strong>Amount paid:</strong> {formatAudCents(invoice.amount_paid_cents)}
              </>
            ) : (
              <>
                <strong>Total paid:</strong>{' '}
                {formatAudCents(invoice.amount_paid_cents ?? invoice.amount_cents)}
              </>
            )}
            {' · '}
          </>
        ) : (
          <>
            <strong>Due (PayID / transfer):</strong> {formatAudCents(invoice.amount_cents)}
            {cardPremium ? (
              <>
                {' '}
                · <strong>Due if paying by card:</strong> {formatAudCents(stripeTotal)}
                <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                  {' '}
                  (includes card processing)
                </span>
              </>
            ) : null}
            {' · '}
          </>
        )}
        <strong>Due date:</strong> {invoice.due_date} · <strong>Status:</strong> {invoice.status}
      </p>
      {invoice.status === 'awaiting_proof' ? (
        <p className="panel-notice">Payment submitted and awaiting confirmation by admin.</p>
      ) : null}
      {timeline.length ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Last update: {new Date(timeline[0].created_at).toLocaleString()}
        </p>
      ) : null}
      {invoice.description ? <p>{invoice.description}</p> : null}

      {lineItems.length ? (
        <div style={{ marginTop: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Line items</h3>
          <table className="data invoice-lines-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'right', width: '5rem' }}>Qty</th>
                <th style={{ textAlign: 'right', width: '7rem' }}>Unit</th>
                <th style={{ textAlign: 'right', width: '7rem' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((row, idx) => (
                <tr key={`${idx}-${row.description}`}>
                  <td>{row.description}</td>
                  <td style={{ textAlign: 'right' }}>{row.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{formatAudCents(row.unitPriceCents)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {formatAudCents(lineAmountCents(row.quantity, row.unitPriceCents))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={3} style={{ textAlign: 'right' }}>
                  Total (PayID / transfer)
                </th>
                <th style={{ textAlign: 'right' }}>{formatAudCents(invoice.amount_cents)}</th>
              </tr>
            </tfoot>
          </table>
          {!paid && cardPremium ? (
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Stripe checkout is charged at {formatAudCents(stripeTotal)} so card processing is
              included; PayID or bank transfer is {formatAudCents(invoice.amount_cents)}.
            </p>
          ) : null}
        </div>
      ) : null}

      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button type="button" className="btn" onClick={() => downloadInvoice()}>
          Download invoice PDF
        </button>
        {paid ? (
          <button type="button" className="btn btn-ghost" onClick={() => downloadReceipt()}>
            Download receipt
          </button>
        ) : null}
      </div>

      {!paid && canPayOnline ? (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem' }}>Pay with Stripe</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            You will be charged {formatAudCents(stripeTotal)}
            {cardPremium ? ' (includes estimated card processing).' : '.'}
          </p>
          <button type="button" className="btn" disabled={busy} onClick={() => payStripe()}>
            Pay {formatAudCents(stripeTotal)} with Stripe
          </button>
        </div>
      ) : null}

      {!paid ? (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem' }}>PayID & bank transfer</h3>
          {pay.pay_id ? <p>PayID: {pay.pay_id}</p> : <p>PayID not configured yet.</p>}
          {pay.bsb && pay.account_number ? (
            <div
              className="invoice-bank-details"
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'var(--panel-2, rgba(0,0,0,0.04))',
                fontSize: '0.95rem',
                lineHeight: 1.5,
              }}
            >
              <p style={{ margin: '0 0 0.35rem', fontWeight: 600 }}>Direct deposit (AUD)</p>
              {pay.bank_account_name ? (
                <p style={{ margin: 0 }}>
                  <strong>Account name</strong> {pay.bank_account_name}
                </p>
              ) : null}
              <p style={{ margin: '0.25rem 0 0' }}>
                <strong>BSB</strong> {formatBsb(String(pay.bsb))}
              </p>
              <p style={{ margin: '0.25rem 0 0' }}>
                <strong>Account number</strong> {pay.account_number}
              </p>
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Please use the invoice number as the payment description so we can match your
                transfer.
              </p>
            </div>
          ) : (
            <p>Bank details not configured yet.</p>
          )}
          {canOffline ? (
            <>
              <label className="field" style={{ marginTop: '0.75rem' }}>
                Payment reference (optional)
                <input value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                After you pay via PayID or transfer, submit here. We will confirm and issue your
                receipt.
              </p>
              <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => offlinePaid()}>
                I have paid via PayID / bank transfer
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {busy ? <p style={{ marginTop: '0.5rem' }}>Please wait…</p> : null}
    </div>
  )
}
