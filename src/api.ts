const API_BASE = import.meta.env.VITE_API_URL || ''

const TOKEN_KEY = 'bm_token'

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  const h = authHeaders()
  if ('Authorization' in h) headers.set('Authorization', h.Authorization as string)
  if (
    init.body &&
    typeof init.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  if (!res.ok) {
    const err =
      typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: string }).error)
        : res.statusText
    throw new Error(err)
  }
  return data as T
}

export async function apiBlob(path: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || 'Download failed')
  }
  return res.blob()
}

export type ContactLeadInput = {
  name: string
  email: string
  company: string | null
  message: string
  website: string | null
}

export async function submitContactLead(input: ContactLeadInput) {
  return apiJson<{ ok: boolean; leadId: string }>('/api/public/contact', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type PublicSeoCheck = {
  inputUrl: string
  scannedAt: string
  score: number
  summary: string
  checks: Array<{
    key: string
    label: string
    ok: boolean
    plainEnglish: string
    recommendation: string
  }>
  priorityActions: string[]
}

export type StoredSeoReport = {
  id: string
  target_url?: string
  normalized_url: string
  domain: string
  score: number
  summary: string
  checks?: PublicSeoCheck['checks']
  priority_actions?: string[]
  request_email?: string | null
  client_name?: string | null
  source?: string
  created_at: string
}

export async function runPublicSeoCheck(url: string, email?: string, clientName?: string) {
  return apiJson<{ ok: boolean; reportId: string; report: PublicSeoCheck }>('/api/public/seo-check', {
    method: 'POST',
    body: JSON.stringify({ url, email, clientName }),
  })
}

export async function getPublicSeoReport(id: string) {
  return apiJson<{ ok: boolean; report: StoredSeoReport }>(`/api/public/seo-check/${encodeURIComponent(id)}`)
}

export async function listPublicSeoReportsByEmail(email: string, limit = 10) {
  const p = new URLSearchParams({ email, limit: String(limit) })
  return apiJson<{ ok: boolean; reports: StoredSeoReport[] }>(`/api/public/seo-check?${p.toString()}`)
}
