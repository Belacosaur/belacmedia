import { QRCodeSVG } from 'qrcode.react'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiBlob, apiBlobResult, apiJson, clearToken } from '../api'
import BrandLogo from '../components/BrandLogo'
import { formatAudCents } from '../formatMoney'
import { invoicePdfDownloadName } from '../invoiceFilenames'
import {
  collectLineItemsFromRows,
  defaultDueDate,
  defaultScheduleRun,
  newCustomLine,
  audToCents,
  cadencePresetToInterval,
  extractCoveragePeriod,
  formatAdminDueDate,
  formatAdminIssuedDate,
  formatAdminLineBreakdown,
  hasNonUnitQuantities,
  invoiceNoteExcludingCoverage,
  parseInvoiceLineItems,
  scheduleCadenceCoverageExplanation,
  scheduleCadenceShort,
  SCHEDULE_CADENCE_OPTIONS,
} from './adminDashboardUtils'
import type {
  Client,
  Invoice,
  Schedule,
  ScheduleCadencePresetId,
  Template,
} from './adminDashboardUtils'
import '../portal.css'

type ContactLead = {
  id: string
  name: string
  email: string
  company: string | null
  message: string
  source: string
  ip: string | null
  createdAt: string
}

type AdminSection = 'dashboard' | 'compose' | 'invoices' | 'clients' | 'schedules' | 'settings' | 'contact'

export default function AdminDashboard() {
  const nav = useNavigate()
  const [tab, setTab] = useState<AdminSection>('dashboard')
  const [composerMode, setComposerMode] = useState<'oneoff' | 'recurring'>('oneoff')
  const [clients, setClients] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [contactLeads, setContactLeads] = useState<ContactLead[]>([])
  const [org, setOrg] = useState<Record<string, string | null>>({})
  const [error, setError] = useState('')
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null)
  const [share, setShare] = useState<{ link: string } | null>(null)
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('')

  const [newClient, setNewClient] = useState({ email: '', name: '', password: '' })
  const [showAddClientForm, setShowAddClientForm] = useState(false)
  const [clientEdit, setClientEdit] = useState<{
    id: string
    name: string
    email: string
    password: string
  } | null>(null)
  const [created, setCreated] = useState<{
    portalToken?: string
    temporaryPassword?: string
    client?: Client
  } | null>(null)

  const [invForm, setInvForm] = useState(() => ({
    clientId: '',
    dueDate: defaultDueDate(),
    periodStart: '',
    periodEnd: '',
    templateKey: 'default',
    mode: 'template' as 'template' | 'custom',
    invoiceDescription: '',
    customLines: [newCustomLine()],
  }))

  const [schForm, setSchForm] = useState(() => ({
    clientId: '',
    name: '',
    nextRunAt: defaultScheduleRun(),
    cadencePreset: 'monthly_1' as ScheduleCadencePresetId,
    intervalUnit: 'monthly',
    intervalCount: 1,
    occurrenceLimit: '',
    lineMode: 'simple' as 'simple' | 'advanced',
    simpleAmountAud: '',
    scheduleLineDescription: '',
    scheduleDescription: '',
    customLines: [newCustomLine()],
    dueDaysAfterRun: 14,
  }))

  const resolvedScheduleCadence = useMemo(() => {
    return schForm.cadencePreset === 'custom'
      ? {
          intervalUnit: schForm.intervalUnit,
          intervalCount: Math.max(1, schForm.intervalCount || 1),
        }
      : cadencePresetToInterval(schForm.cadencePreset)
  }, [schForm.cadencePreset, schForm.intervalUnit, schForm.intervalCount])

  const upcomingActiveSchedules = useMemo(() => {
    return schedules
      .filter((s) => s.active)
      .slice()
      .sort((a, b) => new Date(a.next_run_at).getTime() - new Date(b.next_run_at).getTime())
  }, [schedules])

  const invoiceMoneySummary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    let totalInvoicedCents = 0
    let totalPaidCents = 0
    let overdueOutstandingCents = 0
    let upcomingOutstandingCents = 0

    for (const inv of invoices) {
      if (inv.status === 'draft' || inv.status === 'void') continue

      totalInvoicedCents += Number(inv.amount_cents) || 0

      if (inv.status === 'paid') {
        const paid =
          inv.amount_paid_cents != null && Number.isFinite(Number(inv.amount_paid_cents))
            ? Number(inv.amount_paid_cents)
            : Number(inv.amount_cents) || 0
        totalPaidCents += paid
        continue
      }

      if (inv.status === 'issued' || inv.status === 'awaiting_proof') {
        const due = (inv.due_date || '').slice(0, 10)
        const amt = Number(inv.amount_cents) || 0
        if (due && due < today) overdueOutstandingCents += amt
        else upcomingOutstandingCents += amt
      }
    }

    return {
      totalInvoicedCents,
      totalPaidCents,
      overdueOutstandingCents,
      upcomingOutstandingCents,
    }
  }, [invoices])

  const load = useCallback(async () => {
    setError('')
    try {
      if (tab === 'dashboard' || tab === 'contact') {
        const r = await apiJson<{ leads: ContactLead[] }>('/api/admin/contact-leads')
        setContactLeads(r.leads)
      }
      if (tab === 'dashboard' || tab === 'clients' || tab === 'compose' || tab === 'invoices' || tab === 'schedules') {
        const r = await apiJson<{ clients: Client[] }>('/api/admin/clients')
        setClients(r.clients)
      }
      if (tab === 'dashboard' || tab === 'invoices') {
        const qs = new URLSearchParams()
        if (tab === 'invoices') {
          if (invoiceSearch.trim()) qs.set('search', invoiceSearch.trim())
          if (invoiceStatusFilter) qs.set('status', invoiceStatusFilter)
        }
        const [r, schR] = await Promise.all([
          apiJson<{ invoices: Invoice[] }>(
            `/api/admin/invoices${qs.toString() ? `?${qs.toString()}` : ''}`,
          ),
          apiJson<{ schedules: Schedule[] }>('/api/admin/schedules'),
        ])
        setInvoices(r.invoices)
        setSchedules(schR.schedules)
      }
      if (tab === 'schedules' || tab === 'compose') {
        const [r, t] = await Promise.all([
          apiJson<{ schedules: Schedule[] }>('/api/admin/schedules'),
          apiJson<{ templates: Template[] }>('/api/admin/invoice-templates'),
        ])
        setSchedules(r.schedules)
        setTemplates(t.templates)
      }
      if (tab === 'settings' || tab === 'dashboard') {
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
        nav('/app/login', { replace: true })
      }
    }
  }, [invoiceSearch, invoiceStatusFilter, nav, tab])

  useEffect(() => {
    void Promise.resolve().then(() => load())
  }, [load])

  async function saveClientEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientEdit) return
    try {
      const body: { name: string; email: string; password?: string } = {
        name: clientEdit.name.trim(),
        email: clientEdit.email.trim(),
      }
      const pw = clientEdit.password.trim()
      if (pw.length > 0) {
        if (pw.length < 8) {
          setBanner(null)
          setError('New password must be at least 8 characters.')
          return
        }
        body.password = pw
      }
      await apiJson(`/api/admin/clients/${clientEdit.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      setClientEdit(null)
      setError('')
      setBanner({ type: 'ok', text: 'Client account updated.' })
      await load()
    } catch (err) {
      setBanner(null)
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

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
      setShowAddClientForm(false)
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

  async function deleteClientAccount(client: Client) {
    const label = client.name.trim() || client.email
    if (
      !window.confirm(
        `Permanently delete account for "${label}"?\n\nThis removes their portal access and deletes all invoices and recurring schedules tied to this customer. This cannot be undone.`,
      )
    ) {
      return
    }
    try {
      await apiJson(`/api/admin/clients/${client.id}`, { method: 'DELETE' })
      setClientEdit((e) => (e?.id === client.id ? null : e))
      setError('')
      setBanner({ type: 'ok', text: 'Client account removed.' })
      await load()
    } catch (err) {
      setBanner(null)
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  function resetInvoiceForm() {
    setInvForm({
      clientId: '',
      dueDate: defaultDueDate(),
      periodStart: '',
      periodEnd: '',
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
      periodStart: inv.period_start ? String(inv.period_start).slice(0, 10) : '',
      periodEnd: inv.period_end ? String(inv.period_end).slice(0, 10) : '',
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
      periodStart: invForm.periodStart.trim(),
      periodEnd: invForm.periodEnd.trim(),
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
      const dupName =
        schForm.name.trim() &&
        schedules.some(
          (s) =>
            s.active &&
            s.client_id === schForm.clientId &&
            s.name.trim().toLowerCase() === schForm.name.trim().toLowerCase(),
        )
      if (
        dupName &&
        !window.confirm(
          `You already have an active schedule named "${schForm.name.trim()}" for this client. Create another anyway?`,
        )
      ) {
        return
      }

      const cadence =
        schForm.cadencePreset === 'custom'
          ? {
              intervalUnit: schForm.intervalUnit,
              intervalCount: Math.max(1, schForm.intervalCount || 1),
            }
          : cadencePresetToInterval(schForm.cadencePreset)

      const body: Record<string, unknown> = {
        clientId: schForm.clientId,
        name: schForm.name,
        nextRunAt: new Date(schForm.nextRunAt).toISOString(),
        intervalUnit: cadence.intervalUnit,
        intervalCount: cadence.intervalCount,
        dueDaysAfterRun: schForm.dueDaysAfterRun,
      }
      const ol = schForm.occurrenceLimit.trim()
      if (ol) {
        const n = Number(ol)
        if (!Number.isFinite(n) || n < 1) {
          setError('Stop after: enter a whole number ≥ 1, or leave blank for unlimited runs.')
          return
        }
        body.occurrenceLimit = Math.floor(n)
      }
      if (schForm.lineMode === 'advanced') {
        const lineItems = collectLineItemsFromRows(schForm.customLines)
        if (!lineItems) {
          setError('Schedule: add at least one valid line (description, qty, unit AUD).')
          return
        }
        body.lineItems = lineItems
        body.description = schForm.scheduleDescription.trim() || null
      } else {
        const cents = audToCents(schForm.simpleAmountAud)
        if (cents <= 0) {
          setError(
            'Enter the amount for each invoice (ex‑GST line total), e.g. 250 for $250. GST is added automatically if enabled.',
          )
          return
        }
        const lineDesc =
          schForm.scheduleLineDescription.trim() ||
          schForm.name.trim() ||
          'Scheduled services'
        body.lineItems = [{ description: lineDesc, quantity: 1, unitPriceCents: cents }]
        body.description = schForm.scheduleDescription.trim() || null
      }
      await apiJson('/api/admin/schedules', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setError('')
      setBanner({ type: 'ok', text: 'Schedule saved. First invoice issued immediately.' })
      setSchForm((f) => ({
        ...f,
        name: '',
        occurrenceLimit: '',
        cadencePreset: 'monthly_1',
        intervalUnit: 'monthly',
        intervalCount: 1,
        lineMode: 'simple',
        simpleAmountAud: '',
        scheduleLineDescription: '',
        customLines: [newCustomLine()],
        scheduleDescription: '',
      }))
      await load()
    } catch (err) {
      setBanner(null)
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function markPaid(
    id: string,
    paymentMethod: 'payid' | 'bank_transfer' | 'stripe' | 'manual',
  ) {
    try {
      await apiJson(`/api/admin/invoices/${id}/mark-paid`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod }),
      })
      setError('')
      setBanner({ type: 'ok', text: 'Invoice marked paid.' })
      load()
    } catch (err) {
      setBanner(null)
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

  async function deleteDraftFromList(id: string) {
    if (
      !window.confirm(
        'Permanently delete this draft? This cannot be undone (only drafts can be deleted).',
      )
    ) {
      return
    }
    try {
      await apiJson(`/api/admin/invoices/${id}`, { method: 'DELETE' })
      setError('')
      if (editingDraftId === id) resetInvoiceForm()
      setBanner({ type: 'ok', text: 'Draft deleted.' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function voidInvoiceFromList(id: string) {
    if (
      !window.confirm(
        'Void this invoice? It will be hidden from the client portal and cannot be paid. Paid invoices cannot be voided here.',
      )
    ) {
      return
    }
    try {
      await apiJson(`/api/admin/invoices/${id}/void`, {
        method: 'POST',
        body: JSON.stringify({}),
      })
      setError('')
      setBanner({ type: 'ok', text: 'Invoice voided.' })
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

  async function deleteSchedule(id: string) {
    if (
      !window.confirm(
        'Delete this schedule permanently? Existing invoices are not deleted (their link to this automation is cleared).',
      )
    ) {
      return
    }
    try {
      await apiJson(`/api/admin/schedules/${id}`, { method: 'DELETE' })
      setError('')
      setBanner({ type: 'ok', text: 'Schedule deleted.' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function runScheduleNow(id: string, name: string) {
    if (
      !window.confirm(
        `Issue the next invoice from "${name}" now?\n\nThis creates the upcoming invoice immediately, emails the client, and advances the schedule to its next run.`,
      )
    ) {
      return
    }
    try {
      const r = await apiJson<{ invoiceNumber?: string }>(
        `/api/admin/schedules/${id}/run-now`,
        { method: 'POST' },
      )
      setError('')
      setBanner({
        type: 'ok',
        text: r.invoiceNumber
          ? `Invoice ${r.invoiceNumber} issued from "${name}".`
          : `Invoice issued from "${name}".`,
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue invoice')
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
      <main className="portal-main portal-main--admin">
        {error ? <p className="error">{error}</p> : null}
        {banner?.type === 'ok' ? (
          <p className="banner-ok" role="status">
            {banner.text}
          </p>
        ) : null}
        {banner?.type === 'err' ? <p className="error">{banner.text}</p> : null}

        <div className="admin-shell">
          <aside className="admin-sidebar">
            <p className="admin-sidebar-title">Workspace</p>
            {(
              [
                ['dashboard', 'Dashboard'],
                ['compose', 'Create invoice'],
                ['invoices', 'Invoices'],
                ['clients', 'Accounts'],
                ['schedules', 'Recurring schedules'],
                ['settings', 'Settings'],
                ['contact', 'Leads'],
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
          </aside>

          <section className="admin-content">
        {tab === 'dashboard' ? (
          <div className="panel">
            <h2>Admin dashboard</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Quick view of accounts, invoices, recurring schedules, and inbound leads.
            </p>
            <div className="admin-summary-grid">
              <div className="admin-summary-card">
                <div className="admin-summary-label">Clients</div>
                <div className="admin-summary-value">{clients.length}</div>
              </div>
              <div className="admin-summary-card">
                <div className="admin-summary-label">Invoices</div>
                <div className="admin-summary-value">{invoices.length}</div>
              </div>
              <div className="admin-summary-card">
                <div className="admin-summary-label">Active schedules</div>
                <div className="admin-summary-value">{schedules.filter((s) => s.active).length}</div>
              </div>
              <div className="admin-summary-card">
                <div className="admin-summary-label">Website leads</div>
                <div className="admin-summary-value">{contactLeads.length}</div>
              </div>
            </div>
            <h3 style={{ fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.35rem' }}>
              Invoice money
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Totals exclude drafts and voids. Outstanding is unpaid issued invoices (plus awaiting
              confirmation), split by whether the due date has passed.
            </p>
            <div className="admin-summary-grid">
              <div className="admin-summary-card">
                <div className="admin-summary-label">Total invoiced</div>
                <div className="admin-summary-value">
                  {formatAudCents(invoiceMoneySummary.totalInvoicedCents)}
                </div>
              </div>
              <div className="admin-summary-card">
                <div className="admin-summary-label">Total paid</div>
                <div className="admin-summary-value">
                  {formatAudCents(invoiceMoneySummary.totalPaidCents)}
                </div>
              </div>
              <div className="admin-summary-card">
                <div className="admin-summary-label">Outstanding (overdue)</div>
                <div className="admin-summary-value">
                  {formatAudCents(invoiceMoneySummary.overdueOutstandingCents)}
                </div>
              </div>
              <div className="admin-summary-card">
                <div className="admin-summary-label">Outstanding (upcoming)</div>
                <div className="admin-summary-value">
                  {formatAudCents(invoiceMoneySummary.upcomingOutstandingCents)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1rem' }}>
              <button type="button" className="btn" onClick={() => setTab('compose')}>
                Create invoice
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setTab('invoices')}>
                Manage invoices
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setTab('clients')}>
                Manage accounts
              </button>
            </div>
          </div>
        ) : null}

        {tab === 'compose' ? (
          <div className="panel">
            <h2>Create invoice</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
              One place for both one-off and recurring billing.
            </p>
            <div className="invoice-mode-toggle" role="group" aria-label="Invoice type">
              <button
                type="button"
                className={composerMode === 'oneoff' ? 'active' : ''}
                onClick={() => setComposerMode('oneoff')}
              >
                One-off
              </button>
              <button
                type="button"
                className={composerMode === 'recurring' ? 'active' : ''}
                onClick={() => setComposerMode('recurring')}
              >
                Recurring
              </button>
            </div>
          </div>
        ) : null}

        {tab === 'contact' ? (
          <div className="panel">
            <h2>Website contact requests</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Submissions from the marketing site contact form ({contactLeads.length} loaded, newest
              first).
            </p>
            {contactLeads.length === 0 ? (
              <p className="panel-notice">No submissions yet.</p>
            ) : (
              <div className="table-scroll" style={{ marginTop: '1rem' }}>
                <table className="data clients-table contact-leads-table">
                  <thead>
                    <tr>
                      <th>Received</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Company</th>
                      <th>Message</th>
                      <th>Source</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                          {new Date(lead.createdAt).toLocaleString()}
                        </td>
                        <td>{lead.name}</td>
                        <td>
                          <a href={`mailto:${lead.email}`}>{lead.email}</a>
                        </td>
                        <td>{lead.company || '—'}</td>
                        <td className="contact-lead-message">{lead.message}</td>
                        <td style={{ fontSize: '0.85rem' }}>{lead.source}</td>
                        <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          {lead.ip || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}

        {tab === 'clients' ? (
          <div className="panel">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: showAddClientForm ? '1rem' : 0,
              }}
            >
              <h2 style={{ margin: 0 }}>Clients</h2>
              {!showAddClientForm ? (
                <button type="button" className="btn" onClick={() => setShowAddClientForm(true)}>
                  Add account
                </button>
              ) : null}
            </div>
            {showAddClientForm ? (
              <form
                onSubmit={createClient}
                className="row"
                style={{ flexDirection: 'column', alignItems: 'stretch' }}
              >
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
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn">
                    Create client account
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowAddClientForm(false)
                      setCreated(null)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
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
            <div className="table-scroll" style={{ marginTop: '1rem' }}>
              <table className="data clients-table">
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
                    <Fragment key={c.id}>
                      <tr>
                        <td>{c.name}</td>
                        <td>{c.email}</td>
                        <td>{c.hasPortalToken ? 'Ready' : '—'}</td>
                        <td style={{ whiteSpace: 'normal' }}>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() =>
                              setClientEdit({
                                id: c.id,
                                name: c.name,
                                email: c.email,
                                password: '',
                              })
                            }
                          >
                            Edit account
                          </button>
                          <button type="button" className="btn btn-ghost" onClick={() => rotatePortal(c.id)}>
                            Share portal link & QR
                          </button>
                          <button type="button" className="btn btn-ghost" onClick={() => deactivatePortal(c.id)}>
                            Disable link
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ color: '#b91c1c' }}
                            onClick={() => deleteClientAccount(c)}
                          >
                            Remove account
                          </button>
                        </td>
                      </tr>
                      {clientEdit?.id === c.id ? (
                        <tr className="clients-edit-row">
                          <td colSpan={4}>
                            <form
                              onSubmit={saveClientEdit}
                              className="row"
                              style={{
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                gap: '0.65rem',
                                padding: '0.75rem 0',
                                maxWidth: '28rem',
                              }}
                            >
                              <p style={{ margin: 0, fontWeight: 600 }}>Edit customer account</p>
                              <label className="field">
                                Name
                                <input
                                  value={clientEdit.name}
                                  onChange={(e) =>
                                    setClientEdit({ ...clientEdit, name: e.target.value })
                                  }
                                  required
                                />
                              </label>
                              <label className="field">
                                Email
                                <input
                                  type="email"
                                  autoComplete="off"
                                  value={clientEdit.email}
                                  onChange={(e) =>
                                    setClientEdit({ ...clientEdit, email: e.target.value })
                                  }
                                  required
                                />
                              </label>
                              <label className="field">
                                New password (optional — min 8 chars if changing)
                                <input
                                  type="password"
                                  autoComplete="new-password"
                                  value={clientEdit.password}
                                  onChange={(e) =>
                                    setClientEdit({ ...clientEdit, password: e.target.value })
                                  }
                                />
                              </label>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button type="submit" className="btn">
                                  Save changes
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost"
                                  onClick={() => setClientEdit(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
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

        {tab === 'invoices' || (tab === 'compose' && composerMode === 'oneoff') ? (
          <div className="panel">
            {tab === 'invoices' ? <h2 style={{ margin: 0 }}>Invoice management</h2> : null}
            {tab === 'compose' ? (
              <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>
                {editingDraftId ? 'Edit draft invoice' : tab === 'compose' ? 'One-off invoice' : 'Create invoice'}
              </h2>
              {editingDraftId ? (
                <>
                  <button type="button" className="btn btn-ghost" onClick={() => resetInvoiceForm()}>
                    Cancel edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ color: '#b91c1c' }}
                    onClick={() => deleteDraftFromList(editingDraftId)}
                  >
                    Delete draft
                  </button>
                </>
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

              <div className="row" style={{ marginTop: '0.35rem' }}>
                <label className="field">
                  Invoicing period start (optional)
                  <input
                    type="date"
                    value={invForm.periodStart}
                    onChange={(e) => setInvForm({ ...invForm, periodStart: e.target.value })}
                  />
                </label>
                <label className="field">
                  Invoicing period end (optional)
                  <input
                    type="date"
                    value={invForm.periodEnd}
                    onChange={(e) => setInvForm({ ...invForm, periodEnd: e.target.value })}
                  />
                </label>
              </div>
              <p className="custom-lines-hint" style={{ marginTop: '-0.25rem', marginBottom: '0.5rem' }}>
                Leave both blank if not needed. When set, both dates are required and appear on the PDF as{' '}
                DD/MM/YYYY - DD/MM/YYYY (e.g. 06/05/2026 - 12/05/2026).
              </p>

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
            {tab === 'compose' ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                One-off invoice creation uses the same manual invoice pipeline, with optional draft-save.
              </p>
            ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              <strong>Templates</strong> are presets in <code>invoiceTemplates.js</code> — each creates{' '}
              <strong>one invoice</strong> at the template line totals (not automatically split by month).{' '}
              Use the <strong>Recurring</strong> tab for monthly automation.{' '}
              <strong>Custom lines</strong> use the same PDF pipeline; the list below shows qty × unit so a
              single total never hides what was billed.{' '}
              <strong>Drafts</strong> can be deleted from the list; <strong>issued</strong> invoices can be{' '}
              <strong>voided</strong> (hidden from clients, not payable). Paid invoices cannot be voided here.
            </p>
            )}
              </>
            ) : null}
            {tab === 'invoices' ? (
              <>
            {upcomingActiveSchedules.length ? (
              <div className="panel-notice" style={{ marginTop: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Upcoming from automation</h3>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Not invoices yet — no invoice number until the run time passes and the billing job creates
                  them. The client also sees these on their billing page as &quot;next invoice&quot;.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {upcomingActiveSchedules.map((s) => {
                    const due = new Date(s.next_run_at)
                    due.setUTCDate(due.getUTCDate() + (s.due_days_after_run ?? 14))
                    return (
                      <li key={s.id}>
                        <strong>{s.client_name ?? 'Client'}</strong> — {s.name}. Next run{' '}
                        {new Date(s.next_run_at).toLocaleString()} (
                        {scheduleCadenceShort(s.interval_unit, s.interval_count)}). Line total{' '}
                        <strong>{formatAudCents(s.amount_cents)}</strong> ex‑GST (GST added when issued if
                        enabled). Due date will be {due.toISOString().slice(0, 10)}.
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}
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
            <div className="table-scroll">
              <table className="data invoices-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Client</th>
                    <th>What&apos;s billed</th>
                    <th>Total</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((i) => {
                  const lines = parseInvoiceLineItems(i.line_items)
                  const breakdown = formatAdminLineBreakdown(lines)
                  const coverage = extractCoveragePeriod(i.description)
                  const note = invoiceNoteExcludingCoverage(i.description)
                  const fromSchedule = Boolean(i.source_schedule_id)
                  const cadence = fromSchedule
                    ? scheduleCadenceShort(
                        i.source_schedule_interval_unit,
                        i.source_schedule_interval_count ?? 1,
                      )
                    : ''
                  const qtyWarning = hasNonUnitQuantities(lines)
                  const sub = i.subtotal_cents
                  const tax = i.tax_cents
                  const showGst =
                    tax != null &&
                    Number(tax) > 0 &&
                    sub != null &&
                    Number.isFinite(Number(sub))

                  return (
                  <tr key={i.id}>
                    <td>
                      <strong>{i.invoice_number}</strong>
                    </td>
                    <td className="admin-inv-client-cell">
                      <div>{i.client_name || '—'}</div>
                      {i.client_email ? (
                        <div className="admin-inv-client-email">{i.client_email}</div>
                      ) : null}
                    </td>
                    <td className="admin-inv-detail-cell">
                      <div>
                        {fromSchedule ? (
                          <span className="admin-inv-badge admin-inv-badge--recurring">Recurring</span>
                        ) : (
                          <span className="admin-inv-badge admin-inv-badge--manual">Manual</span>
                        )}
                        {fromSchedule && i.source_schedule_name ? (
                          <span style={{ marginLeft: '0.35rem', fontWeight: 600 }}>{i.source_schedule_name}</span>
                        ) : null}
                        {cadence ? (
                          <span className="admin-inv-cadence">({cadence})</span>
                        ) : null}
                      </div>
                      {coverage ? (
                        <div className="admin-inv-coverage">
                          <strong>Period:</strong> {coverage}
                        </div>
                      ) : null}
                      {note ? <div className="admin-inv-note">{note}</div> : null}
                      {breakdown.length ? (
                        <ul className="admin-inv-line-list">
                          {breakdown.map((line, idx) => (
                            <li key={`${i.id}-line-${idx}`}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="admin-inv-coverage">No line items in payload</div>
                      )}
                      {qtyWarning ? (
                        <div className="admin-inv-warn">
                          Quantity other than 1 on at least one line — this row total is qty × unit for this
                          invoice only.
                        </div>
                      ) : null}
                    </td>
                    <td className="admin-inv-money-cell">
                      <strong>{formatAudCents(i.amount_cents)}</strong>
                      {showGst ? (
                        <div className="admin-inv-money-sub">
                          Subtotal {formatAudCents(Number(sub))} · GST {formatAudCents(Number(tax))}
                        </div>
                      ) : null}
                    </td>
                    <td className="admin-inv-dates-cell">
                      <div>
                        <strong>Issued</strong> {formatAdminIssuedDate(i.created_at)}
                      </div>
                      <div style={{ marginTop: '0.2rem' }}>
                        <strong>Due</strong> {formatAdminDueDate(i.due_date)}
                      </div>
                    </td>
                    <td>{i.status}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize: '0.8rem', marginRight: '0.35rem' }}
                        onClick={async () => {
                          const { blob, filename } = await apiBlobResult(
                            `/api/admin/invoices/${i.id}/pdf`,
                          )
                          const pdfName = filename ?? invoicePdfDownloadName(i.invoice_number)
                          const file = new File([blob], pdfName, { type: 'application/pdf' })
                          const url = URL.createObjectURL(file)
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
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.75rem', color: '#b91c1c' }}
                            onClick={() => deleteDraftFromList(i.id)}
                          >
                            Delete draft
                          </button>
                        </>
                      ) : null}
                      {i.status !== 'paid' && i.status !== 'void' && i.status !== 'draft' ? (
                        <>
                          <button
                            type="button"
                            className="btn"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => markPaid(i.id, 'manual')}
                          >
                            Mark paid
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.75rem', color: '#b45309' }}
                            onClick={() => voidInvoiceFromList(i.id)}
                          >
                            Void
                          </button>
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
                  )
                })}
                </tbody>
              </table>
            </div>
              </>
            ) : null}
          </div>
        ) : null}

        {tab === 'schedules' || (tab === 'compose' && composerMode === 'recurring') ? (
          <div className="panel">
            <h2>{tab === 'compose' ? 'Recurring invoice setup' : 'Recurring or scheduled billing'}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Each run creates one <strong>issued</strong> invoice. The due date is the run time plus the
              offset below (default 14 days). Upcoming charges are listed on the{' '}
              <strong>Invoices</strong> tab before the first issue.
            </p>
            {tab === 'compose' ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                This creates the recurring automation. Invoice numbers are created only when each run is issued.
              </p>
            ) : null}
            {tab === 'compose' ? (
            <div className="panel-notice schedule-billing-notice" style={{ marginTop: '0.75rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>How recurring works here</p>
              <ul style={{ margin: 0, paddingLeft: '1.15rem', fontSize: '0.82rem', lineHeight: 1.45 }}>
                <li>
                  <strong>Monthly billing:</strong> choose <strong>Every month</strong>, enter your{' '}
                  <strong>amount per invoice</strong> below — each run creates <strong>one separate invoice</strong>{' '}
                  for that amount (not one giant multi‑month bill).
                </li>
                <li>
                  <strong>Stop after N invoices:</strong> use “Stop after” for e.g. 12 monthly invoices.
                </li>
                <li>
                  Avoid advanced “every N months” unless you intentionally want <strong>one invoice covering N
                  months</strong>.
                </li>
              </ul>
            </div>
            ) : null}
            {tab === 'compose' ? (
            <form onSubmit={createSchedule}>
              <div className="invoice-mode-toggle" role="group" aria-label="Schedule billing shape">
                <button
                  type="button"
                  className={schForm.lineMode === 'simple' ? 'active' : ''}
                  onClick={() => setSchForm((f) => ({ ...f, lineMode: 'simple' }))}
                >
                  One amount per invoice
                </button>
                <button
                  type="button"
                  className={schForm.lineMode === 'advanced' ? 'active' : ''}
                  onClick={() => setSchForm((f) => ({ ...f, lineMode: 'advanced' }))}
                >
                  Multiple lines
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
                <label className="field" style={{ minWidth: 'min(100%, 22rem)' }}>
                  How often should we invoice?
                  <select
                    value={schForm.cadencePreset}
                    onChange={(e) =>
                      setSchForm({
                        ...schForm,
                        cadencePreset: e.target.value as ScheduleCadencePresetId,
                      })
                    }
                  >
                    {SCHEDULE_CADENCE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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
                <label className="field">
                  Stop after (optional)
                  <input
                    type="number"
                    min={1}
                    max={999}
                    placeholder="Unlimited"
                    value={schForm.occurrenceLimit}
                    onChange={(e) => setSchForm({ ...schForm, occurrenceLimit: e.target.value })}
                  />
                </label>
              </div>

              <p
                className="schedule-cadence-explainer"
                style={{
                  margin: '0.5rem 0 0',
                  fontSize: '0.82rem',
                  lineHeight: 1.45,
                  color: 'var(--text-muted)',
                }}
              >
                {scheduleCadenceCoverageExplanation(
                  resolvedScheduleCadence.intervalUnit,
                  resolvedScheduleCadence.intervalCount,
                )}
              </p>

              {schForm.cadencePreset === 'custom' ? (
                <div className="row" style={{ marginTop: '0.65rem', alignItems: 'flex-end' }}>
                  <label className="field">
                    Interval (advanced)
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
                    Step / repeat every (advanced)
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={schForm.intervalCount}
                      onChange={(e) =>
                        setSchForm({ ...schForm, intervalCount: Number(e.target.value) || 1 })
                      }
                    />
                  </label>
                  <div
                    style={{
                      alignSelf: 'end',
                      fontSize: '0.76rem',
                      color: '#b45309',
                      maxWidth: '14rem',
                      lineHeight: 1.35,
                    }}
                  >
                    For monthly retainers this should almost always be <strong>1</strong>. Values above 1
                    merge multiple months into one invoice.
                  </div>
                </div>
              ) : null}

              <label className="field" style={{ marginTop: '0.85rem', display: 'block', maxWidth: '36rem' }}>
                Note on each invoice (optional)
                <input
                  value={schForm.scheduleDescription}
                  onChange={(e) => setSchForm({ ...schForm, scheduleDescription: e.target.value })}
                  placeholder="Shown on the PDF above coverage dates — e.g. retainer scope"
                />
              </label>

              {schForm.lineMode === 'simple' ? (
                <div style={{ marginTop: '0.85rem' }}>
                  <div className="row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <label className="field" style={{ minWidth: '14rem', flex: '1 1 14rem' }}>
                      Line title on invoice (optional)
                      <input
                        value={schForm.scheduleLineDescription}
                        onChange={(e) =>
                          setSchForm({ ...schForm, scheduleLineDescription: e.target.value })
                        }
                        placeholder={`Defaults to schedule label (${schForm.name.trim() || 'your label'})`}
                      />
                    </label>
                    <label className="field" style={{ minWidth: '11rem' }}>
                      Amount per invoice (AUD, ex‑GST line)
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={schForm.simpleAmountAud}
                        onChange={(e) => setSchForm({ ...schForm, simpleAmountAud: e.target.value })}
                        placeholder="e.g. 250"
                      />
                    </label>
                    <button type="submit" className="btn">
                      Save schedule
                    </button>
                  </div>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Preview line total:{' '}
                    <strong>
                      {formatAudCents(Math.max(0, audToCents(schForm.simpleAmountAud)))}
                    </strong>{' '}
                    per run (GST added on issue if enabled in Settings).
                  </p>
                </div>
              ) : (
                <div className="custom-lines-block">
                  <p className="custom-lines-hint" style={{ marginTop: '0.85rem' }}>
                    Each run copies these lines into a new invoice — same rules as manual invoices (qty × unit
                    AUD).
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
            ) : null}
            {tab === 'schedules' ? (
              <>
            <h2 style={{ marginTop: '1.5rem' }}>Schedules</h2>
            <div className="table-scroll">
              <table className="data schedules-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Name</th>
                    <th>Next run</th>
                    <th>Cadence</th>
                    <th>Due +days</th>
                    <th>Per invoice</th>
                    <th>Invoices sent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>{s.client_name}</td>
                    <td>{s.name}</td>
                    <td>{new Date(s.next_run_at).toLocaleString()}</td>
                    <td>
                      <span title={`${s.interval_unit} × ${s.interval_count}`}>
                        {scheduleCadenceShort(s.interval_unit, s.interval_count)}
                      </span>
                    </td>
                    <td>{s.due_days_after_run ?? 14}</td>
                    <td>
                      <strong>{formatAudCents(s.amount_cents)}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>each automated run</div>
                    </td>
                    <td>
                      {s.runs_completed ?? 0}
                      {s.occurrence_limit != null ? ` / ${s.occurrence_limit}` : ''}
                      {s.occurrence_limit == null ? (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}> (no limit)</span>
                      ) : null}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {s.active ? 'Active' : 'Paused'}
                      </span>
                      <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {s.active ? (
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => runScheduleNow(s.id, s.name)}
                          >
                            Issue next invoice now
                          </button>
                        ) : null}
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
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ fontSize: '0.72rem', color: '#b91c1c' }}
                          onClick={() => deleteSchedule(s.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
              </>
            ) : null}
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
          </section>
        </div>
      </main>
    </div>
  )
}
