import { QRCodeSVG } from 'qrcode.react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiBlob, apiJson, clearToken } from '../api'
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
  client_name?: string
}

type Template = { key: string; label: string; description: string }

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
  const [share, setShare] = useState<{ link: string } | null>(null)

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
  }))

  const [schForm, setSchForm] = useState(() => ({
    clientId: '',
    name: '',
    nextRunAt: defaultScheduleRun(),
    intervalUnit: 'monthly',
    intervalCount: 1,
    templateKey: 'default',
  }))

  const load = useCallback(async () => {
    setError('')
    try {
      if (tab === 'clients') {
        const r = await apiJson<{ clients: Client[] }>('/api/admin/clients')
        setClients(r.clients)
      }
      if (tab === 'invoices') {
        const [r, t, cr] = await Promise.all([
          apiJson<{ invoices: Invoice[] }>('/api/admin/invoices'),
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
  }, [nav, tab])

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

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiJson('/api/admin/invoices', {
        method: 'POST',
        body: JSON.stringify({
          clientId: invForm.clientId,
          dueDate: invForm.dueDate,
          templateKey: invForm.templateKey,
        }),
      })
      load()
      alert('Invoice created')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function createSchedule(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiJson('/api/admin/schedules', {
        method: 'POST',
        body: JSON.stringify({
          clientId: schForm.clientId,
          name: schForm.name,
          nextRunAt: new Date(schForm.nextRunAt).toISOString(),
          intervalUnit: schForm.intervalUnit,
          intervalCount: schForm.intervalCount,
          templateKey: schForm.templateKey,
        }),
      })
      load()
      alert('Schedule saved')
    } catch (err) {
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
        }),
      })
      setOrg(r.organization)
      alert('Saved')
    } catch (err) {
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
        <Link to="/">← Belac Media</Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Admin</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="portal-main">
        {error ? <p className="error">{error}</p> : null}

        <div className="tabs">
          {(
            [
              ['clients', 'Clients'],
              ['invoices', 'Invoices'],
              ['schedules', 'Recurring'],
              ['settings', 'PayID & bank'],
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
              <div className="panel" style={{ marginTop: '1rem', background: 'var(--surface)' }}>
                <p className="success">Client created.</p>
                {created.temporaryPassword ? (
                  <p>
                    <strong>Temporary password:</strong> {created.temporaryPassword}
                  </p>
                ) : null}
                <p>
                  <strong>Portal token (share via your own channel or rotate for a link):</strong>
                </p>
                <pre style={{ fontSize: '0.75rem' }}>{created.portalToken}</pre>
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
            <h2>Create invoice from template</h2>
            <form onSubmit={createInvoice}>
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
                <button type="submit" className="btn">
                  Issue invoice
                </button>
              </div>
            </form>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Templates are editable in the backend under <code>invoiceTemplates.js</code>.
            </p>
            <h2 style={{ marginTop: '1.5rem' }}>All invoices</h2>
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
                      {i.status !== 'paid' && i.status !== 'void' ? (
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
            <form onSubmit={createSchedule}>
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
            </form>
            <h2 style={{ marginTop: '1.5rem' }}>Active schedules</h2>
            <table className="data">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Name</th>
                  <th>Next run</th>
                  <th>Interval</th>
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
                    <td>{s.active ? 'yes' : 'no'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === 'settings' ? (
          <div className="panel">
            <h2>PayID & bank details (shown on invoices)</h2>
            <form onSubmit={saveOrg}>
              <label className="field">
                Brand name
                <input
                  value={org.brand_name || ''}
                  onChange={(e) => setOrg({ ...org, brand_name: e.target.value })}
                />
              </label>
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
