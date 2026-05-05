import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { apiJson, clearToken, getToken } from '../api'

type Role = 'admin' | 'client'

type MeResponse = {
  user: {
    role: Role
  }
}

export default function RequireRole({
  role,
  redirectTo,
  children,
}: {
  role: Role
  redirectTo: string
  children: ReactElement
}) {
  const token = getToken()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!token) {
      return
    }
    let cancelled = false
    apiJson<MeResponse>('/api/auth/me')
      .then((res) => {
        if (cancelled) return
        setAllowed(res.user.role === role)
        setReady(true)
      })
      .catch(() => {
        if (cancelled) return
        clearToken()
        setAllowed(false)
        setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [role, token])

  if (!token) return <Navigate to={redirectTo} replace />
  if (!ready) return <div className="portal-main">Loading...</div>
  if (!allowed) return <Navigate to={redirectTo} replace />
  return children
}
