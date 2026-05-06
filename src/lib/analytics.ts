declare global {
  interface Window {
    /** Shared queue used by GA4 gtag and optionally GTM */
    dataLayer?: unknown[]
    /** Google Analytics 4 / gtag.js */
    gtag?: (...args: unknown[]) => void
  }
}

type AnalyticsMode = 'none' | 'ga4' | 'gtm'

let mode: AnalyticsMode = 'none'
let gaMeasurementId: string | null = null

function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

function gtagJsAlreadyLoaded(gaId: string): boolean {
  return [...document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]')].some(
    (el) =>
      el.getAttribute('src')?.includes(encodeURIComponent(gaId)) ||
      el.getAttribute('src')?.includes(gaId) ||
      false,
  )
}

/**
 * Initialise analytics once at app startup.
 *
 * **Direct GA4 (recommended):** Set `VITE_GA_MEASUREMENT_ID`. The official `gtag.js` snippet is
 * injected into `index.html` at **build/dev time** via `vite.config.ts`. This function only fills in
 * dynamic loading when the snippet is absent (e.g. tests).
 *
 * **GTM:** Set `VITE_GTM_ID` only if you load GA4 through Tag Manager instead (no direct GA env).
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()
  const gtmId = import.meta.env.VITE_GTM_ID?.trim()
  const gaDebug = import.meta.env.VITE_GA_DEBUG === 'true'

  if (import.meta.env.DEV && gaId && gtmId) {
    console.warn(
      '[analytics] VITE_GA_MEASUREMENT_ID and VITE_GTM_ID are both set; using GA4 direct path only. Remove VITE_GTM_ID unless intentional.',
    )
  }

  if (gaId) {
    mode = 'ga4'
    gaMeasurementId = gaId
    window.dataLayer = window.dataLayer || []

    if (!gtagJsAlreadyLoaded(gaId)) {
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer!.push(args)
      }
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
      document.head.appendChild(script)
      window.gtag('js', new Date())
      window.gtag('config', gaId, {
        send_page_view: false,
        ...(gaDebug ? { debug_mode: true } : {}),
      })
    }
    return
  }

  if (gtmId) {
    mode = 'gtm'
    window.dataLayer = window.dataLayer || []
    const gtmAlreadyLoaded = [...document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]')].some(
      (el) => el.getAttribute('src')?.includes(gtmId) ?? false,
    )
    if (!gtmAlreadyLoaded) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
      script.setAttribute('data-gtm-id', gtmId)
      document.head.appendChild(script)
      window.dataLayer.push({
        'gtm.start': Date.now(),
        event: 'gtm.js',
        gtm_id: gtmId,
      })
    }
  }
}

/**
 * SPA navigation: send a page_view with path (include query string when relevant).
 */
export function trackPage(path: string): void {
  if (typeof window === 'undefined') return

  const page_title = typeof document !== 'undefined' ? document.title : undefined
  const page_location =
    typeof window !== 'undefined' ? `${window.location.origin}${path}` : undefined

  if (mode === 'ga4' && gaMeasurementId && window.gtag) {
    window.gtag('config', gaMeasurementId, {
      page_path: path,
      page_title,
      page_location,
    })
    return
  }

  pushDataLayer({
    event: 'page_view',
    page_path: path,
    page_title,
    page_location,
  })
}

/** Custom event (GA4 recommended: lowercase_snake_case names). */
export function trackEvent(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return

  if (mode === 'ga4' && window.gtag) {
    window.gtag('event', event, params)
    return
  }

  pushDataLayer({
    event,
    ...params,
  })
}
