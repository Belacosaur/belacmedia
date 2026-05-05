import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import '../App.css'

export default function MarketingHome() {
  return (
    <div className="page">
      <header className="header header-with-actions">
        <Link to="/" className="header-brand" aria-label="Belac Media home">
          <BrandLogo variant="header" decorative />
        </Link>
        <Link to="/app" className="portal-entry">
          Client portal
        </Link>
      </header>

      <main className="main">
        <section className="hero" aria-labelledby="hero-heading">
          <BrandLogo variant="hero" />
          <p className="eyebrow">Narrative · production · presence</p>
          <h1 id="hero-heading">Stories worth telling</h1>
          <p className="lead">
            Belac Media is your partner for thoughtful content, polished production,
            and a brand voice that resonates.
          </p>
          <a className="cta" href="mailto:hello@belacmedia.com">
            Get in touch
          </a>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Belac Media</p>
      </footer>
    </div>
  )
}
