import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson, setToken } from '../api'
import BrandLogo from '../components/BrandLogo'
import '../portal.css'

export default function AdminLogin() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiJson<{ token: string; user: { role: string } }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      )
      if (res.user.role !== 'admin') {
        setError('This account is not an admin.')
        return
      }
      setToken(res.token)
      nav('/app/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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
        <div className="panel" style={{ maxWidth: 400 }}>
          <div style={{ textAlign: 'center' }}>
            <BrandLogo variant="panel" />
          </div>
          <h2 style={{ marginTop: '0.35rem' }}>Admin sign in</h2>
          <form onSubmit={onSubmit}>
            <label className="field">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="field" style={{ marginTop: '0.75rem' }}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error ? <p className="error">{error}</p> : null}
            <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <Link to="/app/forgot-password" className="link-inline">
              Forgot password?
            </Link>
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <Link to="/app/admin/setup" className="link-inline">
              First-time admin setup
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
