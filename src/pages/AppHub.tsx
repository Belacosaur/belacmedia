import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import '../portal.css'

export default function AppHub() {
  return (
    <div className="portal-page">
      <header className="portal-header">
        <Link to="/" className="portal-header-brand" aria-label="Belac Media home">
          <BrandLogo variant="header" decorative />
          <span className="portal-header-brand-text">Home</span>
        </Link>
        <span style={{ fontWeight: 600 }}>Portal</span>
      </header>
      <main className="portal-main">
        <div className="panel">
          <h2>Choose how you are signing in</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
            Admins manage clients, invoices, and billing. Clients view invoices, pay, and
            download receipts.
          </p>
          <div className="row" style={{ marginTop: '1rem' }}>
            <Link to="/app/admin/login" className="btn">
              Admin sign in
            </Link>
            <Link to="/app/client/login" className="btn btn-ghost">
              Client sign in
            </Link>
            <Link to="/app/client/magic" className="btn btn-ghost">
              Open portal link
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
