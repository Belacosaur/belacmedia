import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import '../App.css'

export default function PrivacyPolicy() {
  return (
    <div className="page">
      <header className="header header-with-actions">
        <Link to="/" className="header-brand" aria-label="Belac Media home">
          <BrandLogo variant="header" decorative />
        </Link>
      </header>
      <main id="main-content" className="main static-main">
        <article className="legal-card">
          <h1>Privacy Policy</h1>
          <p>
            We collect contact details that you submit to respond to your request, deliver services,
            and improve our operations.
          </p>
          <p>
            We do not sell personal data. Data is stored in our service providers for hosting,
            analytics, and communication under reasonable security controls.
          </p>
          <p>
            To request access, correction, or deletion, email <a href="mailto:hello@belacmedia.com">hello@belacmedia.com</a>.
          </p>
        </article>
      </main>
    </div>
  )
}
