import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiJson } from '../api'
import BrandLogo from '../components/BrandLogo'
import '../portal.css'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    if (password !== password2) {
      setError('Passwords do not match.')
      return
    }
    if (!token) {
      setError('Missing reset token. Open the link from your email again.')
      return
    }
    setLoading(true)
    try {
      await apiJson('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })
      nav('/app/client/login', { replace: true, state: { resetOk: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
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
          <h2>Set a new password</h2>
          {!token ? (
            <p className="error">This page needs a valid reset link. Request a new one from forgot password.</p>
          ) : (
            <form onSubmit={onSubmit}>
              <label className="field">
                New password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              <label className="field" style={{ marginTop: '0.75rem' }}>
                Confirm password
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              {error ? <p className="error">{error}</p> : null}
              <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? 'Saving…' : 'Save password'}
              </button>
            </form>
          )}
          <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <Link to="/app/forgot-password" className="link-inline">
              Request another link
            </Link>
            {' · '}
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
