import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson, setToken } from '../api'
import BrandLogo from '../components/BrandLogo'
import '../portal.css'

export default function AdminSetup() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiJson<{ token: string }>('/api/auth/bootstrap', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      })
      setToken(res.token)
      nav('/app/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
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
          <div style={{ textAlign: 'center' }}>
            <BrandLogo variant="panel" />
          </div>
          <h2 style={{ marginTop: '0.35rem' }}>Create first admin</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            This only works while no admin account exists. Use a strong password.
          </p>
          <form onSubmit={onSubmit}>
            <label className="field">
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="field" style={{ marginTop: '0.75rem' }}>
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
                minLength={8}
              />
            </label>
            {error ? <p className="error">{error}</p> : null}
            <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Saving…' : 'Create admin'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
