import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiJson, setToken } from '../api'
import '../portal.css'

export default function ClientLogin() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/app/client'

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
      if (res.user.role !== 'client') {
        setError('This login is for client accounts only.')
        return
      }
      setToken(res.token)
      nav(next, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page">
      <header className="portal-header">
        <Link to="/app">← Portal</Link>
      </header>
      <main className="portal-main">
        <div className="panel" style={{ maxWidth: 400 }}>
          <h2>Client sign in</h2>
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
            <Link to="/app/client/magic">Have a portal link instead?</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
