import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import ContactForm from '../components/ContactForm'
import { trackEvent } from '../lib/analytics'
import '../App.css'

export default function MarketingHome() {
  return (
    <div className="page">
      <header className="header header-with-actions">
        <Link to="/" className="header-brand" aria-label="Belac Media home">
          <BrandLogo variant="header" decorative />
        </Link>
        <Link
          to="/app"
          className="portal-entry"
          onClick={() => trackEvent('click_cta_client_portal', { location: 'header' })}
        >
          Client portal
        </Link>
      </header>

      <main id="main-content" className="main">
        <div className="marketing-layout">
          <section className="hero" aria-labelledby="hero-heading">
            <BrandLogo variant="hero" />
            <p className="eyebrow">Narrative · production · presence</p>
            <h1 id="hero-heading">Build a brand people remember</h1>
            <p className="lead">
              Belac Media combines creative storytelling, design, and engineering to launch polished
              campaigns and web experiences that convert.
            </p>
            <a
              className="cta"
              href="#contact"
              onClick={() => trackEvent('click_cta_get_in_touch', { location: 'hero' })}
            >
              Start your project
            </a>
          </section>

          <section className="info-grid" aria-label="Services and process">
            <article className="info-card">
              <h2>Services</h2>
              <ul>
                <li>Brand strategy and visual identity</li>
                <li>Social content production and campaign ops</li>
                <li>Web design and full-stack development</li>
              </ul>
            </article>
            <article className="info-card">
              <h2>Process</h2>
              <ol>
                <li>Discover goals and audience signals</li>
                <li>Design, ship, and iterate weekly</li>
                <li>Report outcomes with transparent KPIs</li>
              </ol>
            </article>
            <article className="info-card">
              <h2>Proof</h2>
              <p>
                Early pilots focused on faster campaign turnaround, cleaner billing workflows, and
                stronger client communication.
              </p>
            </article>
            <article className="info-card">
              <h2>FAQ</h2>
              <p>
                We support one-off projects and monthly retainers. Typical onboarding starts within
                five business days.
              </p>
            </article>
          </section>

          <section id="contact" className="contact-card" aria-labelledby="contact-heading">
            <h2 id="contact-heading">Tell us what you are building</h2>
            <p className="contact-lead">
              Share your goals and timeline. We will follow up with next steps and a scoped proposal.
            </p>
            <ContactForm />
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Belac Media</p>
        <p className="footer-links">
          <Link to="/privacy">Privacy</Link>
          <span>·</span>
          <Link to="/terms">Terms</Link>
        </p>
      </footer>
    </div>
  )
}
