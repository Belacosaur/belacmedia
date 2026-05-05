import { QRCodeSVG } from 'qrcode.react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiBlob, apiJson, clearToken } from '../api'
import BrandLogo from '../components/BrandLogo'
import '../portal.css'

type Client = {
  id: string
  email: string
  name: string
  hasPortalToken: boolean
  portalTokenExpiresAt: string | null
}

type Invoice = {
  id: string
  client_id: string
  invoice_number: string
  status: string
  amount_cents: number
  due_date: string
  description: string | null
  line_items?: { description: string; quantity: number; unitPriceCents: number }[]
}

type Schedule = {
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

type Template = { key: string; label: string; description: string }

type CustomLineRow = { id: string; description: string; quantity: string; unitAud: string }

function collectLineItemsFromRows(rows: CustomLineRow[]) {
  const lineItems = rows
    .map((row) => ({
      description: row.description.trim(),
      quantity: Math.max(0, Number.parseFloat(row.quantity) || 0),
      unitPriceCents: audToCents(row.unitAud),
    }))
    .filter((r) => r.description && r.quantity > 0 && r.unitPriceCents > 0)
  return lineItems.length ? lineItems : null
}

function newCustomLine(): CustomLineRow {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? String(Math.random()),
    description: '',
    quantity: '1',
    unitAud: '',
  }
}

function audToCents(aud: string): number {
  const n = Number.parseFloat(aud.replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100)
}

function defaultDueDate() {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().slice(0, 10)
}

function defaultScheduleRun() {
  const nr = new Date()
  nr.setMinutes(nr.getMinutes() + 5)
  return nr.toISOString().slice(0, 16)
}

export default function AdminDashboard() {
  const nav = useNavigate()
  const [tab, setTab] = useState<'clients' | 'invoices' | 'schedules' | 'settings'>('clients')
  const [clients, setClients] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [org, setOrg] = useState<Record<string, string | null>>({})
  const [error, setError] = useState('')
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null)
  const [share, setShare] = useState<{ link: string } | null>(null)
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('')

  const [newClient, setNewClient] = useState({ email: '', name: '', password: '' })
  const [created, setCreated] = useState<{
    portalToken?: string
    temporaryPassword?: string
    client?: Client
  } | null>(null)

  const [invForm, setInvForm] = useState(() => ({
    clientId: '',
    dueDate: defaultDueDate(),
    templateKey: 'default',
    mode: 'template' as 'template' | 'custom',
    invoiceDescription: '',
    customLines: [newCustomLine()],
  }))

  const [schForm, setSchForm] = useState(() => ({
    clientId: '',
    name: '',
    nextRunAt: defaultScheduleRun(),
    intervalUnit: 'monthly',
    intervalCount: 1,
    mode: 'template' as 'template' | 'custom',
    templateKey: 'default',
    scheduleDescription: '',
    customLines: [newCustomLine()],
    dueDaysAfterRun: 14,
  }))

  const load = useCallback(async () => {
    setError('')
    try {
      if (tab === 'clients') {
        const r = await apiJson<{ clients: Client[] }>('/api/admin/clients')
        setClients(r.clients)
      }
      if (tab === 'invoices') {
        const qs = new URLSearchParams()
        if (invoiceSearch.trim()) qs.set('search', invoiceSearch.trim())
        if (invoiceStatusFilter) qs.set('status', invoiceStatusFilter)
        const [r, t, cr] = await Promise.all([
          apiJson<{ invoices: Invoice[] }>(
            `/api/admin/invoices${qs.toString() ? `?${qs.toString()}` : ''}`,
          ),
          apiJson<{ templates: Template[] }>('/api/admin/invoice-templates'),
          apiJson<{ clients: Client[] }>('/api/admin/clients'),
        ])
        setInvoices(r.invoices)
        setTemplates(t.templates)
        setClients(cr.clients)
      }
      if (tab === 'schedules') {
        const [r, t, cr] = await Promise.all([
          apiJson<{ schedules: Schedule[] }>('/api/admin/schedules'),
          apiJson<{ templates: Template[] }>('/api/admin/invoice-templates'),
          apiJson<{ clients: Client[] }>('/api/admin/clients'),
        ])
        setSchedules(r.schedules)
        setTemplates(t.templates)
        setClients(cr.clients)
      }
      if (tab === 'settings') {
        const r = await apiJson<{ organization: Record<string, string | null> }>(
          '/api/admin/organization',
        )
        setOrg(r.organization)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Load failed'
      setError(msg)
      if (
        msg.toLowerCase().includes('unauthor') ||
        msg.toLowerCase().includes('invalid token') ||
        msg.toLowerCase().includes('missing authorization')
      ) {
        clearToken()
        nav('/app/admin/login', { replace: true })
      }
    }
  }, [invoiceSearch, invoiceStatusFilter, nav, tab])

  useEffect(() => {
    void Promise.resolve().then(() => load())
  }, [load])

  async function createClient(e: React.FormEvent) {
    e.preventDefault()
    setCreated(null)
    try {
      const r = await apiJson<{
        client: Client
        portalToken: string
        temporaryPassword?: string
      }>('/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify({
          email: newClient.email,
          name: newClient.name,
          password: newClient.password || undefined,
        }),
      })
      setCreated({
        portalToken: r.portalToken,
        temporaryPassword: r.temporaryPassword,
        client: r.client,
      })
      setNewClient({ email: '', name: '', password: '' })
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function rotatePortal(clientId: string) {
    try {
      const r = await apiJson<{ link: string }>(`/api/admin/clients/${clientId}/portal`, {
        method: 'POST',
        body: JSON.stringify({ expiresInDays: 365 }),
      })
      setShare({ link: r.link })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function deactivatePortal(clientId: string) {
    try {
      await apiJson(`/api/admin/clients/${clientId}/portal`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  function resetInvoiceForm() {
    setInvForm({
      clientId: '',
      dueDate: defaultDueDate(),
      templateKey: 'default',
      mode: 'template',
      invoiceDescription: '',
      customLines: [newCustomLine()],
    })
    setEditingDraftId(null)
  }

  function loadDraftForEdit(inv: Invoice) {
    const raw = inv.line_items
    const lines = Array.isArray(raw)
      ? (raw as { description: string; quantity: number; unitPriceCents: number }[])
      : []
    setInvForm({
      clientId: inv.client_id,
      dueDate: (inv.due_date || '').slice(0, 10) || defaultDueDate(),
      templateKey: 'default',
      mode: 'custom',
      invoiceDescription: inv.description || '',
      customLines:
        lines.length > 0
          ? lines.map((r) => ({
              id: globalThis.crypto?.randomUUID?.() ?? String(Math.random()),
              description: r.description,
              quantity: String(r.quantity),
              unitAud: (r.unitPriceCents / 100).toFixed(2),
            }))
          : [newCustomLine()],
    })
    setEditingDraftId(inv.id)
    setBanner({ type: 'ok', text: 'Draft loaded — save changes or issue when ready.' })
    setError('')
    globalThis.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  async function submitInvoice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const sub = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const intent = sub?.value || 'issue'

    const baseBody = {
      clientId: invForm.clientId,
      dueDate: invForm.dueDate,
      description: invForm.invoiceDescription.trim() || null,
    }

    try {
      if (editingDraftId) {
        if (intent === 'save') {
          const lineItems = collectLineItemsFromRows(invForm.customLines)
          if (!lineItems) {
            setError('Add at least one line with a description, quantity, and unit price (AUD).')
            return
          }
          await apiJson(`/api/admin/invoices/${editingDraftId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              clientId: invForm.clientId,
              dueDate: invForm.dueDate,
              description: baseBody.description,
              lineItems,
            }),
          })
          setError('')
          setBanner({ type: 'ok', text: 'Draft updated.' })
          await load()
          return
        }
        if (intent === 'issue') {
          await apiJson(`/api/admin/invoices/${editingDraftId}/issue`, { method: 'POST' })
          setError('')
          resetInvoiceForm()
          setBanner({ type: 'ok', text: 'Invoice issued with official number.' })
          await load()
          return
        }
      }

      if (invForm.mode === 'custom') {
        const lineItems = collectLineItemsFromRows(invForm.customLines)
        if (!lineItems) {
          setError('Add at least one line with a description, quantity, and unit price (AUD).')
          return
        }
        const status = intent === 'draft' ? 'draft' : undefined
        await apiJson('/api/admin/invoices', {
          method: 'POST',
          body: JSON.stringify({
            ...baseBody,
            lineItems,
            ...(status ? { status } : {}),
          }),
        })
      } else {
        const status = intent === 'draft' ? 'draft' : undefined
        await apiJson('/api/admin/invoices', {
          method: 'POST',
          body: JSON.stringify({
            ...baseBody,
            templateKey: invForm.templateKey,
            ...(status ? { status } : {}),
          }),
        })
      }
      setError('')
      if (intent === 'draft') {
        setBanner({
          type: 'ok',
          text: 'Draft saved. Continue editing from the list, or issue when ready.',
        })
      } else {
        resetInvoiceForm()
        setBanner({ type: 'ok', text: 'Invoice issued.' })
      }
      await load()
    } catch (err) {
      setBanner(null)
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  const customLineTotalCents = invForm.customLines.reduce((sum, row) => {
    const q = Math.max(0, Number.parseFloat(row.quantity) || 0)
    const c = audToCents(row.unitAud)
    return sum + Math.round(q * c)
  }, 0)

  const schLineTotalCents = schForm.customLines.reduce((sum, row) => {
    const q = Math.max(0, Number.parseFloat(row.quantity) || 0)
    const c = audToCents(row.unitAud)
    return sum + Math.round(q * c)
  }, 0)

  async function createSchedule(e: React.FormEvent) {
    e.preventDefault()
    try {
      const body: Record<string, unknown> = {
        clientId: schForm.clientId,
        name: schForm.name,
        nextRunAt: new Date(schForm.nextRunAt).toISOString(),
        intervalUnit: schForm.intervalUnit,
        intervalCount: schForm.intervalCount,
        dueDaysAfterRun: schForm.dueDaysAfterRun,
      }
      if (schForm.mode === 'custom') {
        const lineItems = collectLineItemsFromRows(schForm.customLines)
        if (!lineItems) {
          setError('Schedule: add at least one valid line (description, qty, unit AUD).')
          return
        }
        body.lineItems = lineItems
        body.description = schForm.scheduleDescription.trim() || null
      } else {
        body.templateKey = schForm.templateKey
      }
      await apiJson('/api/admin/schedules', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setError('')
      setBanner({ type: 'ok', text: 'Schedule saved.' })
      setSchForm((f) => ({
        ...f,
        name: '',
        customLines: [newCustomLine()],
        scheduleDescription: '',
      }))
      await load()
    } catch (err) {
      setBanner(null)
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function markPaid(id: string, paymentMethod: 'payid' | 'bank_transfer' | 'stripe') {
    try {
      await apiJson(`/api/admin/invoices/${id}/mark-paid`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod }),
      })
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function issueInvoiceFromList(id: string) {
    try {
      await apiJson(`/api/admin/invoices/${id}/issue`, { method: 'POST' })
      setError('')
      if (editingDraftId === id) resetInvoiceForm()
      setBanner({ type: 'ok', text: 'Invoice issued.' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function approveProof(id: string) {
    try {
      await apiJson(`/api/admin/invoices/${id}/approve-proof`, { method: 'POST' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function rejectProof(id: string) {
    try {
      await apiJson(`/api/admin/invoices/${id}/reject-proof`, { method: 'POST' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function sendReminder(id: string) {
    try {
      await apiJson(`/api/admin/invoices/${id}/remind`, { method: 'POST' })
      setBanner({ type: 'ok', text: 'Reminder sent.' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function saveOrg(e: React.FormEvent) {
    e.preventDefault()
    try {
      const r = await apiJson<{ organization: typeof org }>('/api/admin/organization', {
        method: 'PATCH',
        body: JSON.stringify({
          brandName: org.brand_name,
          payId: org.pay_id,
          bankAccountName: org.bank_account_name,
          bsb: org.bsb,
          accountNumber: org.account_number,
          tradingName: org.trading_name,
          legalAddress: org.legal_address,
          abn: org.abn,
          contactEmail: org.contact_email,
          contactPhone: org.contact_phone,
          invoiceLabel: org.invoice_label,
          invoicePrefix: org.invoice_prefix,
          gstEnabled: Boolean(org.gst_enabled),
          gstRate: Number(org.gst_rate ?? 10),
        }),
      })
      setOrg(r.organization)
      setBanner({ type: 'ok', text: 'Settings saved.' })
    } catch (err) {
      setBanner(null)
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  function logout() {
    clearToken()
    nav('/app')
  }

  return (
    <div className="portal-page">
      <header className="portal-header">
        <Link to="/" className="portal-header-brand" aria-label="Belac Media home">
          <BrandLogo variant="header" decorative />
          <span className="portal-header-brand-text">Home</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Admin</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="portal-main">
        {error ? <p className="error">{error}</p> : null}
        {banner?.type === 'ok' ? (
          <p className="banner-ok" role="status">
            {banner.text}
          </p>
        ) : null}
        {banner?.type === 'err' ? <p className="error">{banner.text}</p> : null}

        <div className="tabs">
          {(
            [
              ['clients', 'Clients'],
              ['invoices', 'Invoices'],
              ['schedules', 'Recurring'],
              ['settings', 'Legal & payments'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={tab === k ? 'active' : ''}
              onClick={() => setTab(k)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'clients' ? (
          <div className="panel">
            <h2>Clients</h2>
            <form onSubmit={createClient} className="row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <label className="field">
                Email
                <input
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                Name
                <input
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                Password (optional — min 8 chars if set)
                <input
                  type="password"
                  value={newClient.password}
                  onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                />
              </label>
              <button type="submit" className="btn">
                Create client account
              </button>
            </form>
            {created ? (
              <div className="panel-notice">
                <p className="success">Client created.</p>
                {created.temporaryPassword ? (
                  <p>
                    <strong>Temporary password:</strong> {created.temporaryPassword}
                  </p>
                ) : null}
                <p>
                  <strong>Portal token (share via your own channel or rotate for a link):</strong>
                </p>
                <pre>{created.portalToken}</pre>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Use “Share portal link” to generate a URL and QR clients can scan.
                </p>
              </div>
            ) : null}
            <table className="data" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Portal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.hasPortalToken ? 'Ready' : '—'}</td>
                    <td>
                      <button type="button" className="btn btn-ghost" onClick={() => rotatePortal(c.id)}>
                        Share portal link & QR
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => deactivatePortal(c.id)}>
                        Disable link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {share ? (
              <div className="panel" style={{ marginTop: '1rem' }}>
                <h2>Client portal link</h2>
                <div className="qr-wrap">
                  <QRCodeSVG value={share.link} size={160} level="M" />
                  <div>
                    <p>Send this link or show the QR code:</p>
                    <pre>{share.link}</pre>
                    <button type="button" className="btn btn-ghost" onClick={() => setShare(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === 'invoices' ? (
          <div className="panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>{editingDraftId ? 'Edit draft invoice' : 'Create invoice'}</h2>
              {editingDraftId ? (
                <button type="button" className="btn btn-ghost" onClick={() => resetInvoiceForm()}>
                  Cancel edit
                </button>
              ) : null}
            </div>
            <form onSubmit={submitInvoice}>
              {!editingDraftId ? (
                <div className="invoice-mode-toggle" role="group" aria-label="Invoice source">
                  <button
                    type="button"
                    className={invForm.mode === 'template' ? 'active' : ''}
                    onClick={() => setInvForm((f) => ({ ...f, mode: 'template' }))}
                  >
                    Use template
                  </button>
                  <button
                    type="button"
                    className={invForm.mode === 'custom' ? 'active' : ''}
                    onClick={() => setInvForm((f) => ({ ...f, mode: 'custom' }))}
                  >
                    Custom lines
                  </button>
                </div>
              ) : (
                <p className="panel-notice" style={{ marginTop: '0.75rem' }}>
                  You are editing a draft. Save changes, then Issue to assign the official tax invoice
                  number and send it to the client portal.
                </p>
              )}

              <div className="row">
                <label className="field">
                  Client
                  <select
                    value={invForm.clientId}
                    onChange={(e) => setInvForm({ ...invForm, clientId: e.target.value })}
                    required
                  >
                    <option value="">Select…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  Due date
                  <input
                    type="date"
                    value={invForm.dueDate}
                    onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })}
                    required
                  />
                </label>
              </div>

              <label className="field" style={{ marginTop: '0.5rem' }}>
                Invoice note (optional, shown on PDF)
                <input
                  value={invForm.invoiceDescription}
                  onChange={(e) => setInvForm({ ...invForm, invoiceDescription: e.target.value })}
                  placeholder="e.g. Project name or period"
                />
              </label>

              {!editingDraftId && invForm.mode === 'template' ? (
                <div className="row" style={{ marginTop: '0.75rem', alignItems: 'flex-end' }}>
                  <label className="field">
                    Template
                    <select
                      value={invForm.templateKey}
                      onChange={(e) => setInvForm({ ...invForm, templateKey: e.target.value })}
                    >
                      {templates.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn btn-ghost" name="intent" value="draft">
                      Save draft
                    </button>
                    <button type="submit" className="btn" name="intent" value="issue">
                      Issue invoice
                    </button>
                  </div>
                </div>
              ) : (
                <div className="custom-lines-block">
                  <p className="custom-lines-hint">
                    Enter each line: description, quantity, and unit price in AUD (e.g.{' '}
                    <code>1500</code> or <code>1500.50</code>). Empty rows are ignored.
                  </p>
                  <table className="data custom-lines-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th style={{ width: '5.5rem' }}>Qty</th>
                        <th style={{ width: '7rem' }}>Unit AUD</th>
                        <th style={{ width: '4rem' }} />
                      </tr>
                    </thead>
                    <tbody>
                      {invForm.customLines.map((row, idx) => (
                        <tr key={row.id}>
                          <td>
                            <input
                              aria-label={`Line ${idx + 1} description`}
                              value={row.description}
                              onChange={(e) => {
                                const v = e.target.value
                                setInvForm((f) => ({
                                  ...f,
                                  customLines: f.customLines.map((l) =>
                                    l.id === row.id ? { ...l, description: v } : l,
                                  ),
                                }))
                              }}
                              placeholder="e.g. Video edit — March"
                            />
                          </td>
                          <td>
                            <input
                              aria-label={`Line ${idx + 1} quantity`}
                              type="text"
                              inputMode="decimal"
                              value={row.quantity}
                              onChange={(e) => {
                                const v = e.target.value
                                setInvForm((f) => ({
                                  ...f,
                                  customLines: f.customLines.map((l) =>
                                    l.id === row.id ? { ...l, quantity: v } : l,
                                  ),
                                }))
                              }}
                            />
                          </td>
                          <td>
                            <input
                              aria-label={`Line ${idx + 1} unit AUD`}
                              type="text"
                              inputMode="decimal"
                              value={row.unitAud}
                              onChange={(e) => {
                                const v = e.target.value
                                setInvForm((f) => ({
                                  ...f,
                                  customLines: f.customLines.map((l) =>
                                    l.id === row.id ? { ...l, unitAud: v } : l,
                                  ),
                                }))
                              }}
                              placeholder="0.00"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon"
                              aria-label="Remove line"
                              disabled={invForm.customLines.length <= 1}
                              onClick={() =>
                                setInvForm((f) => ({
                                  ...f,
                                  customLines: f.customLines.filter((l) => l.id !== row.id),
                                }))
                              }
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="custom-lines-footer">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        setInvForm((f) => ({ ...f, customLines: [...f.customLines, newCustomLine()] }))
                      }
                    >
                      Add line
                    </button>
                    <span className="custom-lines-total">
                      Total: {(customLineTotalCents / 100).toFixed(2)} AUD
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {editingDraftId ? (
                        <>
                          <button type="submit" className="btn btn-ghost" name="intent" value="save">
                            Save changes
                          </button>
                          <button type="submit" className="btn" name="intent" value="issue">
                            Issue invoice
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="submit" className="btn btn-ghost" name="intent" value="draft">
                            Save draft
                          </button>
                          <button type="submit" className="btn" name="intent" value="issue">
                            Issue invoice
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              <strong>Templates</strong> are presets in <code>invoiceTemplates.js</code>.{' '}
              <strong>Custom lines</strong> send your own amounts to the same PDF pipeline.
            </p>
            <h2 style={{ marginTop: '1.5rem' }}>All invoices</h2>
            <div className="row" style={{ marginBottom: '0.75rem' }}>
              <label className="field">
                Search
                <input
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="invoice, client, email"
                />
              </label>
              <label className="field">
                Status
                <select
                  value={invoiceStatusFilter}
                  onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="draft">Draft</option>
                  <option value="issued">Issued</option>
                  <option value="awaiting_proof">Awaiting proof</option>
                  <option value="paid">Paid</option>
                  <option value="void">Void</option>
                </select>
              </label>
              <button type="button" className="btn btn-ghost" onClick={() => load()}>
                Apply
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={async () => {
                  const blob = await apiBlob('/api/admin/exports/invoices.csv')
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'invoices-export.csv'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                Export CSV
              </button>
            </div>
            <table className="data">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id}>
                    <td>{i.invoice_number}</td>
                    <td>{i.status}</td>
                    <td>{(i.amount_cents / 100).toFixed(2)} AUD</td>
                    <td>{i.due_date}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize: '0.8rem', marginRight: '0.35rem' }}
                        onClick={async () => {
                          const blob = await apiBlob(`/api/admin/invoices/${i.id}/pdf`)
                          const url = URL.createObjectURL(blob)
                          window.open(url, '_blank', 'noopener,noreferrer')
                          setTimeout(() => URL.revokeObjectURL(url), 60_000)
                        }}
                      >
                        PDF
                      </button>
                      {i.status === 'draft' ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => loadDraftForEdit(i)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => issueInvoiceFromList(i.id)}
                          >
                            Issue
                          </button>
                        </>
                      ) : null}
                      {i.status !== 'paid' && i.status !== 'void' && i.status !== 'draft' ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => markPaid(i.id, 'payid')}
                          >
                            Mark PayID
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => markPaid(i.id, 'bank_transfer')}
                          >
                            Mark transfer
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => markPaid(i.id, 'stripe')}
                          >
                            Mark Stripe
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => sendReminder(i.id)}
                          >
                            Remind
                          </button>
                        </>
                      ) : null}
                      {i.status === 'awaiting_proof' ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => approveProof(i.id)}
                          >
                            Approve proof
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => rejectProof(i.id)}
                          >
                            Reject proof
                          </button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === 'schedules' ? (
          <div className="panel">
            <h2>Recurring or scheduled billing</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Each run creates an issued invoice. <strong>Due date</strong> is the run date plus the
              offset below (default 14 days). Use <strong>Biweekly</strong> for every two weeks.
            </p>
            <form onSubmit={createSchedule}>
              <div className="invoice-mode-toggle" role="group" aria-label="Schedule line source">
                <button
                  type="button"
                  className={schForm.mode === 'template' ? 'active' : ''}
                  onClick={() => setSchForm((f) => ({ ...f, mode: 'template' }))}
                >
                  Use template
                </button>
                <button
                  type="button"
                  className={schForm.mode === 'custom' ? 'active' : ''}
                  onClick={() => setSchForm((f) => ({ ...f, mode: 'custom' }))}
                >
                  Custom lines
                </button>
              </div>

              <div className="row">
                <label className="field">
                  Client
                  <select
                    value={schForm.clientId}
                    onChange={(e) => setSchForm({ ...schForm, clientId: e.target.value })}
                    required
                  >
                    <option value="">Select…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  Label
                  <input
                    value={schForm.name}
                    onChange={(e) => setSchForm({ ...schForm, name: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  First run (local)
                  <input
                    type="datetime-local"
                    value={schForm.nextRunAt}
                    onChange={(e) => setSchForm({ ...schForm, nextRunAt: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  Interval
                  <select
                    value={schForm.intervalUnit}
                    onChange={(e) => setSchForm({ ...schForm, intervalUnit: e.target.value })}
                  >
                    <option value="once">One-off</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>
                <label className="field">
                  Every N periods
                  <input
                    type="number"
                    min={1}
                    value={schForm.intervalCount}
                    onChange={(e) =>
                      setSchForm({ ...schForm, intervalCount: Number(e.target.value) || 1 })
                    }
                  />
                </label>
                <label className="field">
                  Due days after run
                  <input
                    type="number"
                    min={0}
                    max={366}
                    value={schForm.dueDaysAfterRun}
                    onChange={(e) =>
                      setSchForm({
                        ...schForm,
                        dueDaysAfterRun: Math.max(0, Math.min(366, Number(e.target.value) || 0)),
                      })
                    }
                  />
                </label>
              </div>

              {schForm.mode === 'template' ? (
                <div className="row" style={{ marginTop: '0.75rem', alignItems: 'flex-end' }}>
                  <label className="field">
                    Template
                    <select
                      value={schForm.templateKey}
                      onChange={(e) => setSchForm({ ...schForm, templateKey: e.target.value })}
                    >
                      {templates.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="btn">
                    Save schedule
                  </button>
                </div>
              ) : (
                <div className="custom-lines-block">
                  <label className="field" style={{ marginTop: '0.75rem' }}>
                    Note on generated invoices (optional)
                    <input
                      value={schForm.scheduleDescription}
                      onChange={(e) =>
                        setSchForm({ ...schForm, scheduleDescription: e.target.value })
                      }
                      placeholder="e.g. Weekly retainer — Acme"
                    />
                  </label>
                  <p className="custom-lines-hint">
                    Same line rules as manual invoices. Each run copies these lines into a new issued
                    invoice.
                  </p>
                  <table className="data custom-lines-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th style={{ width: '5.5rem' }}>Qty</th>
                        <th style={{ width: '7rem' }}>Unit AUD</th>
                        <th style={{ width: '4rem' }} />
                      </tr>
                    </thead>
                    <tbody>
                      {schForm.customLines.map((row, idx) => (
                        <tr key={row.id}>
                          <td>
                            <input
                              aria-label={`Schedule line ${idx + 1} description`}
                              value={row.description}
                              onChange={(e) => {
                                const v = e.target.value
                                setSchForm((f) => ({
                                  ...f,
                                  customLines: f.customLines.map((l) =>
                                    l.id === row.id ? { ...l, description: v } : l,
                                  ),
                                }))
                              }}
                            />
                          </td>
                          <td>
                            <input
                              aria-label={`Schedule line ${idx + 1} quantity`}
                              type="text"
                              inputMode="decimal"
                              value={row.quantity}
                              onChange={(e) => {
                                const v = e.target.value
                                setSchForm((f) => ({
                                  ...f,
                                  customLines: f.customLines.map((l) =>
                                    l.id === row.id ? { ...l, quantity: v } : l,
                                  ),
                                }))
                              }}
                            />
                          </td>
                          <td>
                            <input
                              aria-label={`Schedule line ${idx + 1} unit AUD`}
                              type="text"
                              inputMode="decimal"
                              value={row.unitAud}
                              onChange={(e) => {
                                const v = e.target.value
                                setSchForm((f) => ({
                                  ...f,
                                  customLines: f.customLines.map((l) =>
                                    l.id === row.id ? { ...l, unitAud: v } : l,
                                  ),
                                }))
                              }}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon"
                              aria-label="Remove schedule line"
                              disabled={schForm.customLines.length <= 1}
                              onClick={() =>
                                setSchForm((f) => ({
                                  ...f,
                                  customLines: f.customLines.filter((l) => l.id !== row.id),
                                }))
                              }
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="custom-lines-footer">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        setSchForm((f) => ({
                          ...f,
                          customLines: [...f.customLines, newCustomLine()],
                        }))
                      }
                    >
                      Add line
                    </button>
                    <span className="custom-lines-total">
                      Total: {(schLineTotalCents / 100).toFixed(2)} AUD
                    </span>
                    <button type="submit" className="btn">
                      Save schedule
                    </button>
                  </div>
                </div>
              )}
            </form>
            <h2 style={{ marginTop: '1.5rem' }}>Active schedules</h2>
            <table className="data">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Name</th>
                  <th>Next run</th>
                  <th>Interval</th>
                  <th>Due +days</th>
                  <th>Amount</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>{s.client_name}</td>
                    <td>{s.name}</td>
                    <td>{new Date(s.next_run_at).toLocaleString()}</td>
                    <td>
                      {s.interval_unit} ×{s.interval_count}
                    </td>
                    <td>{s.due_days_after_run ?? 14}</td>
                    <td>{(s.amount_cents / 100).toFixed(2)} AUD</td>
                    <td>
                      {s.active ? 'yes' : 'no'}
                      <div>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ fontSize: '0.72rem' }}
                          onClick={async () => {
                            await apiJson(`/api/admin/schedules/${s.id}/${s.active ? 'pause' : 'resume'}`, {
                              method: 'POST',
                            })
                            await load()
                          }}
                        >
                          {s.active ? 'Pause' : 'Resume'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === 'settings' ? (
          <div className="panel">
            <h2>Legal entity & invoice letterhead</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Invoice numbers and issue dates are generated automatically when you issue an invoice.
            </p>
            <form onSubmit={saveOrg}>
              <label className="field">
                Legal / business name (letterhead)
                <input
                  value={org.brand_name || ''}
                  onChange={(e) => setOrg({ ...org, brand_name: e.target.value })}
                />
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                Trading name
                <input
                  value={org.trading_name || ''}
                  onChange={(e) => setOrg({ ...org, trading_name: e.target.value })}
                />
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                Business address
                <textarea
                  rows={2}
                  value={org.legal_address || ''}
                  onChange={(e) => setOrg({ ...org, legal_address: e.target.value })}
                />
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                ABN
                <input
                  value={org.abn || ''}
                  onChange={(e) => setOrg({ ...org, abn: e.target.value })}
                />
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                Contact email
                <input
                  type="email"
                  value={org.contact_email || ''}
                  onChange={(e) => setOrg({ ...org, contact_email: e.target.value })}
                />
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                Contact phone
                <input
                  value={org.contact_phone || ''}
                  onChange={(e) => setOrg({ ...org, contact_phone: e.target.value })}
                />
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                Document title (use “Tax invoice” only if you are GST-registered)
                <input
                  value={org.invoice_label || ''}
                  onChange={(e) => setOrg({ ...org, invoice_label: e.target.value })}
                  placeholder="Invoice"
                />
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                Invoice prefix
                <input
                  value={org.invoice_prefix || ''}
                  onChange={(e) => setOrg({ ...org, invoice_prefix: e.target.value })}
                  placeholder="BM"
                />
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                GST enabled
                <select
                  value={String(Boolean(org.gst_enabled))}
                  onChange={(e) => setOrg({ ...org, gst_enabled: e.target.value })}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                GST rate (%)
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={String(org.gst_rate ?? 10)}
                  onChange={(e) => setOrg({ ...org, gst_rate: e.target.value })}
                />
              </label>
              <h3 style={{ marginTop: '1.25rem', fontSize: '1rem' }}>PayID & bank</h3>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                PayID
                <input
                  value={org.pay_id || ''}
                  onChange={(e) => setOrg({ ...org, pay_id: e.target.value })}
                  placeholder="email or phone PayID"
                />
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                Account name
                <input
                  value={org.bank_account_name || ''}
                  onChange={(e) => setOrg({ ...org, bank_account_name: e.target.value })}
                />
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                BSB
                <input
                  value={org.bsb || ''}
                  onChange={(e) => setOrg({ ...org, bsb: e.target.value })}
                />
              </label>
              <label className="field" style={{ marginTop: '0.5rem' }}>
                Account number
                <input
                  value={org.account_number || ''}
                  onChange={(e) => setOrg({ ...org, account_number: e.target.value })}
                />
              </label>
              <button type="submit" className="btn" style={{ marginTop: '1rem' }}>
                Save
              </button>
            </form>
          </div>
        ) : null}
      </main>
    </div>
  )
}
