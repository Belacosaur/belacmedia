import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { apiJson, setToken } from '../api'
import BrandLogo from '../components/BrandLogo'
import '../portal.css'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (resp: { credential: string }) => void
          }) => void
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void
        }
      }
    }
  }
}

export default function ClientLogin() {
  const nav = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const next = params.get('next') || '/app/client'
  const googleBtnRef = useRef<HTMLDivElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)

  const resetOk = Boolean((location.state as { resetOk?: boolean } | null)?.resetOk)

  useEffect(() => {
    const cid = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!cid || !googleBtnRef.current) return

    let cancelled = false

    async function handleCredential(credential: string) {
      setError('')
      setLoading(true)
      try {
        const res = await apiJson<{ token: string; user: { role: string } }>('/api/auth/google', {
          method: 'POST',
          body: JSON.stringify({ credential }),
        })
        if (res.user.role !== 'client') {
          setError('This Google account is not linked to a client profile.')
          return
        }
        setToken(res.token)
        nav(next, { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed')
      } finally {
        setLoading(false)
      }
    }

    const init = () => {
      if (cancelled || !googleBtnRef.current || !window.google?.accounts?.id) return
      googleBtnRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: cid,
        callback: (resp) => {
          if (resp.credential) void handleCredential(resp.credential)
        },
      })
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 280,
        text: 'continue_with',
      })
      setGoogleReady(true)
    }

    const existing = document.querySelector('script[data-bm-google-gsi]')
    if (existing) {
      if (window.google?.accounts?.id) init()
      else existing.addEventListener('load', init, { once: true })
    } else {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.dataset.bmGoogleGsi = '1'
      s.onload = init
      document.body.appendChild(s)
    }

    return () => {
      cancelled = true
    }
  }, [nav, next])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiJson<{ token: string; user: { role: string } }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      )
      if (res.user.role !== 'client') {
        setError('This login is for client accounts only.')
        return
      }
      setToken(res.token)
      nav(next, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const showGoogle = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

  return (
    <div className="portal-page client-login-page">
      <header className="portal-header">
        <Link to="/app" className="portal-header-brand" aria-label="Back to portal">
          <BrandLogo variant="header" decorative />
          <span className="portal-header-brand-text">Portal</span>
        </Link>
      </header>
      <main className="portal-main portal-main--client-login" id="main-content">
        <div className="client-login-layout">
          <section className="client-login-pitch" aria-labelledby="client-login-pitch-title">
            <p className="client-login-eyebrow">Belac Media · Client workspace</p>
            <h1 id="client-login-pitch-title">
              Invoices, payments, and receipts — without the back-and-forth.
            </h1>
            <p className="client-login-lead">
              This portal is how we keep commercial work tidy: you always see what&apos;s owed,
              what&apos;s paid, and how to pay — so your team spends less time chasing paperwork.
            </p>
            <ul className="client-login-benefits">
              <li>
                <strong>Quotes &amp; invoices in one flow.</strong>
                Draft scope becomes a clean invoice you can trust — line items, GST where it
                applies, and a paper trail you can forward internally.
              </li>
              <li>
                <strong>Direct ways to pay.</strong>
                Pay by card when checkout is enabled, or use the bank details on every invoice — no
                guessing which account or reference to use.
              </li>
              <li>
                <strong>Proof when finance asks.</strong>
                Download PDFs and receipts anytime; your history stays in one place instead of lost
                threads.
              </li>
            </ul>
            <p className="client-login-foot">
              Running a studio or agency?{' '}
              <Link to="/#contact">Ask us about a client portal like this</Link> — we design and
              ship the whole stack.
            </p>
          </section>

          <section className="client-login-card-wrap" aria-labelledby="client-login-form-title">
            <div className="panel client-login-panel">
              <div className="client-login-panel-head">
                <BrandLogo variant="panel" decorative />
                <div>
                  <h2 id="client-login-form-title" className="client-login-panel-title">
                    Sign in
                  </h2>
                  <p className="client-login-panel-sub">Access your invoices and payments.</p>
                </div>
              </div>

              {resetOk ? (
                <p className="panel-notice client-login-reset-banner" role="status">
                  Password updated — you can sign in below.
                </p>
              ) : null}

              {showGoogle ? (
                <div className="client-login-google">
                  <div ref={googleBtnRef} className="google-signin-slot" />
                  {!googleReady ? (
                    <p className="client-login-google-hint">Loading Google…</p>
                  ) : null}
                  <p className="client-login-divider">
                    <span>or continue with email</span>
                  </p>
                </div>
              ) : null}

              <form className="client-login-form" onSubmit={onSubmit}>
                <label className="field">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="field">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>
                {error ? <p className="error client-login-error">{error}</p> : null}
                <button type="submit" className="btn client-login-submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <nav className="client-login-links" aria-label="Other sign-in options">
                <Link to="/app/forgot-password" className="link-inline">
                  Forgot password?
                </Link>
                <span className="client-login-links-sep" aria-hidden>
                  ·
                </span>
                <Link to="/app/client/magic" className="link-inline">
                  Have a magic portal link?
                </Link>
              </nav>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
