declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

export function trackPage(path: string) {
  pushDataLayer({
    event: 'page_view',
    page_path: path,
  })
}

export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  pushDataLayer({
    event,
    ...params,
  })
}

export function initAnalytics() {
  const gtmId = import.meta.env.VITE_GTM_ID
  if (!gtmId || typeof window === 'undefined') return
  if (!document.querySelector(`script[data-gtm-id="${gtmId}"]`)) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
    script.setAttribute('data-gtm-id', gtmId)
    document.head.appendChild(script)
  }
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    'gtm.start': Date.now(),
    event: 'gtm.js',
    gtm_id: gtmId,
  })
}
