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
        width: 320,
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
    <div className="portal-page">
      <header className="portal-header">
        <Link to="/app" className="portal-header-brand" aria-label="Back to portal">
          <BrandLogo variant="header" decorative />
          <span className="portal-header-brand-text">Portal</span>
        </Link>
      </header>
      <main className="portal-main">
        <div className="panel" style={{ maxWidth: 400 }}>
          <div style={{ textAlign: 'center' }}>
            <BrandLogo variant="panel" />
          </div>
          <h2 style={{ marginTop: '0.35rem' }}>Client sign in</h2>
          {resetOk ? (
            <p className="panel-notice" style={{ marginBottom: '1rem' }}>
              Password updated. You can sign in below.
            </p>
          ) : null}
          {showGoogle ? (
            <div style={{ marginBottom: '1.25rem' }}>
              <div ref={googleBtnRef} className="google-signin-slot" />
              {!googleReady ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Loading Google…
                </p>
              ) : null}
              <p
                style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  margin: '0.75rem 0 0',
                }}
              >
                or email & password
              </p>
            </div>
          ) : null}
          <form onSubmit={onSubmit}>
            <label className="field">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="field" style={{ marginTop: '0.75rem' }}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error ? <p className="error">{error}</p> : null}
            <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <Link to="/app/forgot-password" className="link-inline">
              Forgot password?
            </Link>
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <Link to="/app/client/magic" className="link-inline">
              Have a portal link instead?
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
