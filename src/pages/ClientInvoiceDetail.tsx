import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { apiBlob, apiJson } from '../api'

type Invoice = {
  id: string
  invoice_number: string
  status: string
  amount_cents: number
  due_date: string
  description: string | null
}

type PayDetails = {
  pay_id?: string | null
  bank_account_name?: string | null
  bsb?: string | null
  account_number?: string | null
}

export default function ClientInvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const [params, setParams] = useSearchParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [pay, setPay] = useState<PayDetails>({})
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setError('')
    try {
      const r = await apiJson<{ invoice: Invoice; paymentDetails: PayDetails }>(
        `/api/client/invoices/${id}`,
      )
      setInvoice(r.invoice)
      setPay(r.paymentDetails)
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
        <strong>Amount:</strong> {(invoice.amount_cents / 100).toFixed(2)} AUD ·{' '}
        <strong>Due:</strong> {invoice.due_date} · <strong>Status:</strong> {invoice.status}
      </p>
      {invoice.description ? <p>{invoice.description}</p> : null}

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
          <button type="button" className="btn" disabled={busy} onClick={() => payStripe()}>
            Pay with Stripe
          </button>
        </div>
      ) : null}

      {!paid ? (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem' }}>PayID & bank transfer</h3>
          {pay.pay_id ? <p>PayID: {pay.pay_id}</p> : <p>PayID not configured yet.</p>}
          {pay.bsb && pay.account_number ? (
            <p>
              Bank: {pay.bank_account_name || ''} · BSB {pay.bsb} · Acc {pay.account_number}
            </p>
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
