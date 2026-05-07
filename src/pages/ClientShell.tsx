import { Link, Outlet, useNavigate } from 'react-router-dom'
import { clearToken } from '../api'
import BrandLogo from '../components/BrandLogo'
import '../portal.css'

export default function ClientShell() {
  const nav = useNavigate()

  function logout() {
    clearToken()
    nav('/app')
  }

  return (
    <div className="portal-page">
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Link to="/" aria-label="Belac Media home" style={{ lineHeight: 0 }}>
            <BrandLogo variant="header" decorative />
          </Link>
          <Link to="/app/client" className="link-inline">
            Billing history
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
