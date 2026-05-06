import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import {
  listPublicSeoReportsByEmail,
  runPublicSeoCheck,
  type PublicSeoCheck,
  type StoredSeoReport,
} from '../api'
import '../portal.css'

export default function SeoChecker() {
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState<PublicSeoCheck | null>(null)
  const [reportId, setReportId] = useState<string>('')
  const [history, setHistory] = useState<StoredSeoReport[]>([])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await runPublicSeoCheck(url, email || undefined, clientName || undefined)
      setReport(res.report)
      setReportId(res.reportId)
      if (email) {
        const historyRes = await listPublicSeoReportsByEmail(email, 10)
        setHistory(historyRes.reports)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to run SEO check.')
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory() {
    if (!email) return
    setHistoryLoading(true)
    setError('')
    try {
      const historyRes = await listPublicSeoReportsByEmail(email, 10)
      setHistory(historyRes.reports)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load report history.')
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <div className="portal-page client-login-page">
      <header className="portal-header">
        <Link to="/" className="portal-header-brand" aria-label="Back to home">
          <BrandLogo variant="header" decorative />
          <span className="portal-header-brand-text">Home</span>
        </Link>
      </header>
      <main className="portal-main portal-main--client-login" id="main-content">
        <div className="client-login-layout">
          <section className="client-login-pitch" aria-labelledby="seo-checker-title">
            <p className="client-login-eyebrow">Belac Media · Free SEO checker</p>
            <h1 id="seo-checker-title">Get your website SEO score in under 30 seconds.</h1>
            <p className="client-login-lead">
              Enter your public website URL and get a clear score, plain-English findings, and top
              actions to improve visibility.
            </p>
            <ul className="client-login-benefits">
              <li>
                <strong>Simple scoring.</strong> Easy to understand before/after benchmarking.
              </li>
              <li>
                <strong>Clear recommendations.</strong> No jargon-heavy audit dump.
              </li>
              <li>
                <strong>Lead-ready output.</strong> Perfect for discovery calls and upsell conversations.
              </li>
            </ul>
          </section>

          <section className="client-login-card-wrap" aria-labelledby="seo-checker-form-title">
            <div className="panel client-login-panel">
              <div className="client-login-panel-head">
                <BrandLogo variant="panel" decorative />
                <div>
                  <h2 id="seo-checker-form-title" className="client-login-panel-title">
                    Run SEO check
                  </h2>
                  <p className="client-login-panel-sub">Use full domain or URL (example.com)</p>
                </div>
              </div>

              <form className="client-login-form" onSubmit={onSubmit}>
                <label className="field">
                  Your name (optional)
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Acme Co"
                  />
                </label>
                <label className="field">
                  Email (to save your reports)
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </label>
                <label className="field">
                  Website URL
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </label>
                {error ? <p className="error client-login-error">{error}</p> : null}
                <button type="submit" className="btn client-login-submit" disabled={loading}>
                  {loading ? 'Scanning…' : 'Get score'}
                </button>
                <button
                  type="button"
                  className="btn client-login-submit"
                  style={{ marginTop: '0.6rem' }}
                  onClick={loadHistory}
                  disabled={!email || historyLoading}
                >
                  {historyLoading ? 'Loading history…' : 'Load saved reports'}
                </button>
              </form>

              {report ? (
                <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
                  <p className="panel-notice" role="status">
                    SEO score: <strong>{report.score}/100</strong> · {report.summary}
                  </p>
                  <p style={{ margin: 0, opacity: 0.8 }}>
                    Scanned: {report.inputUrl} · {new Date(report.scannedAt).toLocaleString()}
                  </p>
                  {reportId ? (
                    <p style={{ margin: 0, opacity: 0.75, fontSize: '0.9rem' }}>
                      Report ID: <code>{reportId}</code>
                    </p>
                  ) : null}
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {report.checks.map((c) => (
                      <div
                        key={c.key}
                        style={{
                          border: '1px solid rgba(255,255,255,0.14)',
                          borderRadius: '10px',
                          padding: '0.6rem 0.75rem',
                        }}
                      >
                        <p style={{ margin: 0 }}>
                          <strong>{c.label}</strong> — {c.ok ? 'Good' : 'Needs work'}
                        </p>
                        <p style={{ margin: '0.35rem 0 0', opacity: 0.9 }}>{c.plainEnglish}</p>
                        {!c.ok ? (
                          <p style={{ margin: '0.35rem 0 0', opacity: 0.8 }}>{c.recommendation}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {history.length ? (
                <div style={{ marginTop: '1rem', display: 'grid', gap: '0.55rem' }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>Saved reports</p>
                  {history.map((h) => (
                    <div
                      key={h.id}
                      style={{
                        border: '1px solid rgba(255,255,255,0.14)',
                        borderRadius: '10px',
                        padding: '0.55rem 0.7rem',
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        <strong>{h.score}/100</strong> · {h.domain}
                      </p>
                      <p style={{ margin: '0.25rem 0 0', opacity: 0.8 }}>
                        {h.summary}
                      </p>
                      <p style={{ margin: '0.25rem 0 0', opacity: 0.7, fontSize: '0.88rem' }}>
                        {new Date(h.created_at).toLocaleString()} · ID: <code>{h.id}</code>
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
