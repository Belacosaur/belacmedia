import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { apiJson, clearToken, getToken } from '../api'
import BrandLogo from '../components/BrandLogo'
import '../portal.css'

export default function ClientShell() {
  const nav = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      nav('/app/client/login', { replace: true })
      return
    }
    let cancelled = false
    apiJson<{ user: { role: string; name: string } }>('/api/auth/me')
      .then((r) => {
        if (cancelled) return
        if (r.user.role !== 'client') {
          clearToken()
          nav('/app/client/login', { replace: true })
          return
        }
        setReady(true)
      })
      .catch(() => {
        if (cancelled) return
        clearToken()
        nav('/app/client/login', { replace: true })
      })
    return () => {
      cancelled = true
    }
  }, [nav])

  function logout() {
    clearToken()
    nav('/app')
  }

  if (!ready) {
    return (
      <div className="portal-page">
        <main className="portal-main">Loading…</main>
      </div>
    )
  }

  return (
    <div className="portal-page">
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Link to="/" aria-label="Belac Media home" style={{ lineHeight: 0 }}>
            <BrandLogo variant="header" decorative />
          </Link>
          <Link to="/app/client" className="link-inline">
            Your invoices
          </Link>
        </div>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          Log out
        </button>
      </header>
      <main className="portal-main">
        <Outlet />
      </main>
    </div>
  )
}
