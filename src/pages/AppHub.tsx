import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import '../portal.css'

export default function AppHub() {
  return (
    <div className="portal-page apphub-page">
      <header className="portal-header">
        <Link to="/" className="portal-header-brand" aria-label="Belac Media home">
          <BrandLogo variant="header" decorative />
          <span className="portal-header-brand-text">Home</span>
        </Link>
        <span style={{ fontWeight: 600 }}>Portal</span>
      </header>
      <main id="main-content" className="portal-main apphub-main">
        <section className="apphub-hero" aria-labelledby="apphub-title">
          <p className="apphub-eyebrow">Belac Media · Client operations portal</p>
          <h1 id="apphub-title">Quotes, invoices, and direct payments in one place.</h1>
          <p className="apphub-lead">
            This is your front door for commercial workflow: approve work, view invoices, pay with
            clear options, and keep clean records without inbox chaos.
          </p>
          <ul className="apphub-points">
            <li>Automated quote-to-invoice flow with consistent line-item detail.</li>
            <li>Direct payment paths so clients can pay faster with less friction.</li>
            <li>Receipts and invoice history available any time in one portal.</li>
          </ul>
        </section>

        <section className="panel apphub-panel" aria-labelledby="apphub-signin-title">
          <h2 id="apphub-signin-title">Sign in to your portal</h2>
          <p className="apphub-signin-sub">
            One login for both teams. We detect your account type and open the right dashboard
            automatically.
          </p>
          <div className="apphub-actions">
            <Link to="/app/login" className="btn">
              Sign in
            </Link>
            <Link to="/app/client/magic" className="btn btn-ghost">
              Open portal link
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
