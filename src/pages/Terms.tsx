import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import '../App.css'

export default function Terms() {
  return (
    <div className="page">
      <header className="header header-with-actions">
        <Link to="/" className="header-brand" aria-label="Belac Media home">
          <BrandLogo variant="header" decorative />
        </Link>
      </header>
      <main id="main-content" className="main static-main">
        <article className="legal-card">
          <h1>Terms of Service</h1>
          <p>
            By engaging Belac Media, you agree that project scope, deliverables, timelines, and fees
            are governed by a signed service agreement.
          </p>
          <p>
            We retain rights to our tools and methods. Client-owned deliverables and intellectual
            property transfer according to the signed agreement.
          </p>
          <p>
            Contact <a href="mailto:hello@belacmedia.com">hello@belacmedia.com</a> for contractual questions.
          </p>
        </article>
      </main>
    </div>
  )
}
