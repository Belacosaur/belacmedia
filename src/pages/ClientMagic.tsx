import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiJson, setToken } from '../api'
import '../portal.css'

export default function ClientMagic() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const tokenFromUrl = params.get('token') || ''
  const [manual, setManual] = useState(tokenFromUrl)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tokenFromUrl) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiJson<{ token: string }>('/api/auth/magic', {
          method: 'POST',
          body: JSON.stringify({ portalToken: tokenFromUrl }),
        })
        if (cancelled) return
        setToken(res.token)
        nav('/app/client', { replace: true })
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Link invalid')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tokenFromUrl, nav])

  function extractToken(raw: string) {
    const s = raw.trim()
    try {
      const u = new URL(s)
      const t = u.searchParams.get('token')
      if (t) return t
    } catch {
      /* not a URL */
    }
    return s
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const res = await apiJson<{ token: string }>('/api/auth/magic', {
        method: 'POST',
        body: JSON.stringify({ portalToken: extractToken(manual) }),
      })
      setToken(res.token)
      nav('/app/client', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid token')
    }
  }

  return (
    <div className="portal-page">
      <header className="portal-header">
        <Link to="/app">← Portal</Link>
      </header>
      <main className="portal-main">
        <div className="panel" style={{ maxWidth: 480 }}>
          <h2>Portal link</h2>
          {tokenFromUrl && !error ? (
            <p>Opening your account…</p>
          ) : null}
          {error ? <p className="error">{error}</p> : null}
          <form onSubmit={submitManual} style={{ marginTop: '1rem' }}>
            <label className="field">
              Paste portal token or full URL query
              <textarea
                rows={3}
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="token from your invite"
              />
            </label>
            <button type="submit" className="btn" style={{ marginTop: '0.75rem' }}>
              Open account
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
