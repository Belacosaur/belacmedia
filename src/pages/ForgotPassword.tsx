import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../api'
import BrandLogo from '../components/BrandLogo'
import '../portal.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiJson('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page">
      <header className="portal-header">
        <Link to="/app" className="portal-header-brand" aria-label="Back to portal">
          <BrandLogo variant="header" decorative />
          <span className="portal-header-brand-text">Portal</span>
        </Link>
      </header>
      <main className="portal-main">
        <div className="panel" style={{ maxWidth: 420 }}>
          <h2>Reset password</h2>
          {done ? (
            <p className="panel-notice">
              If an account exists for that email, we sent a reset link. Check your inbox (and spam).
              The link expires in one hour. If email is not configured on the server, your host may log
              the link in server output instead — ask your administrator.
            </p>
          ) : (
            <form onSubmit={onSubmit}>
              <label className="field">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              {error ? <p className="error">{error}</p> : null}
              <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
          <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <Link to="/app/client/login" className="link-inline">
              Client sign in
            </Link>
            {' · '}
            <Link to="/app/admin/login" className="link-inline">
              Admin sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
